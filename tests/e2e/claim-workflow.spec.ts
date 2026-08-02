import { expect, test, type Page } from "@playwright/test";

import { waitForConfirmationLink } from "./helpers/mailpit";

// Browser coverage for the M5.3 identity-claiming workflow
// (/member/claim, plus its effect on /member and /account). Relies on the
// two fixture `people` rows in supabase/seed.sql ("Ada Lovelace", "Grace
// Hopper") — there is no client-reachable, app-level way to create a
// `people` row in this milestone, so a local Supabase instance must have
// been started/reset with that seed applied (`supabase start` /
// `supabase db reset`) for the tests below that search for a match to
// pass. Redirect-only coverage (unauthenticated access) lives in
// protected-routes.spec.ts, not repeated here. Duplicate-id/overflow/
// console/theme coverage for /member/claim itself lives in
// workspace-pages-quality.spec.ts's existing per-path loop, not repeated
// here either — this file is scoped to the workflow's own behavior.

async function registerAndConfirm(page: Page): Promise<string> {
  const email = `e2e-claim-${Date.now()}@example.com`;
  const password = "correcthorse1";

  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create account" }).click();

  const confirmLink = await waitForConfirmationLink(email);
  await page.goto(confirmLink);

  return email;
}

test.describe("Claim discovery", () => {
  test("an authenticated user can search and find an eligible person record", async ({ page }) => {
    await registerAndConfirm(page);
    await page.goto("/member/claim");

    await page.getByLabel("Search by name").fill("Lovelace");
    await page.getByRole("button", { name: "Search" }).click();

    // Uncertainty framing is explicit, not implied — this is a possible
    // match, never asserted to be a confirmed identity.
    await expect(page.getByText(/possible match/i)).toBeVisible();
    await expect(page.getByText("Ada Lovelace")).toBeVisible();
    await expect(page.getByRole("button", { name: "Select" }).first()).toBeVisible();
  });

  test("a search with no eligible match shows the honest no-matches state, not an error", async ({
    page,
  }) => {
    await registerAndConfirm(page);
    await page.goto("/member/claim");

    await page.getByLabel("Search by name").fill("Zzyzyxqqnomatch");
    await page.getByRole("button", { name: "Search" }).click();

    await expect(page.getByText("No matching person records found")).toBeVisible();
  });

  test("selecting a result moves keyboard focus to the confirmation step", async ({ page }) => {
    await registerAndConfirm(page);
    await page.goto("/member/claim");

    await page.getByLabel("Search by name").fill("Hopper");
    await page.getByRole("button", { name: "Search" }).click();
    await page.getByRole("button", { name: "Select" }).first().click();

    await expect(page.getByRole("heading", { name: "Confirm your claim" })).toBeFocused();
  });
});

test.describe("Claim submission, status, and duplicate prevention", () => {
  test("submitting a claim shows pending status on both /member and /account, blocks a second claim, and withdrawal reopens discovery", async ({
    page,
  }) => {
    await registerAndConfirm(page);
    await page.goto("/member/claim");

    await page.getByLabel("Search by name").fill("Lovelace");
    await page.getByRole("button", { name: "Search" }).click();
    await page.getByRole("button", { name: "Select" }).first().click();
    await page.getByRole("button", { name: "Submit claim" }).click();

    await expect(page.getByText("Your claim has been submitted for review.")).toBeVisible();

    // Pending status on /member: names the person, explains what's
    // happening, offers withdrawal — never a fabricated profile/dashboard.
    await page.goto("/member");
    await expect(page.getByText(/Ada Lovelace is being reviewed/)).toBeVisible();
    const withdrawButton = page.getByRole("button", { name: "Withdraw claim" });
    await expect(withdrawButton).toBeVisible();

    // Account/member integration: /account shows the same status, as a
    // read-only display with no duplicate claim/search controls of its
    // own (see workspace-pages-quality.spec.ts for the "no such controls"
    // assertion in the no-claim case).
    await page.goto("/account");
    await expect(page.getByText(/Ada Lovelace is being reviewed/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Withdraw claim" })).toHaveCount(0);

    // Duplicate prevention: visiting /member/claim directly while a claim
    // is pending does not offer a new search — this is the page-level
    // half of the guard; submit-claim.ts enforces the same rule
    // server-side regardless of what the UI shows.
    await page.goto("/member/claim");
    await expect(page.getByLabel("Search by name")).toHaveCount(0);
    await expect(page.getByText(/already have a claim|being reviewed/i)).toBeVisible();

    // Withdrawal: back on /member, withdraw the pending claim. The
    // withdrawn outcome is shown honestly as its own state (not silently
    // reverted to "not yet connected", which would hide that a claim was
    // ever made — see derive-status.ts's priority ordering), and
    // /member/claim opens back up for a new search since withdrawn is not
    // a blocking state.
    await page.goto("/member");
    await page.getByRole("button", { name: "Withdraw claim" }).click();
    await expect(page.getByText(/You withdrew your claim on Ada Lovelace/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Search again" })).toHaveAttribute(
      "href",
      "/member/claim",
    );

    await page.goto("/member/claim");
    await expect(page.getByLabel("Search by name")).toBeVisible();
  });
});
