import { expect, test, type Page } from "@playwright/test";

import { registerAndConfirm } from "./helpers/auth";
import { attachConsoleWatcher, getDuplicateIds, hasHorizontalOverflow, setStoredTheme } from "./helpers/page-quality";
import { getUserIdByEmail, grantReviewerStatus, revokeReviewerStatus } from "./helpers/reviewer";

// Browser coverage for the M5.4 claim-review workflow (/review/claims,
// /review/claims/[claimId], plus its effect on /member and /account).
//
// Like claim-workflow.spec.ts, this relies on the two fixture `people`
// rows in supabase/seed.sql ("Ada Lovelace", "Grace Hopper"). Unlike that
// file's tests (which only search, or claim-then-withdraw — both fully
// reversible), the approve-flow test below actually approves a claim,
// which permanently consumes one of these two shared fixtures for the
// rest of the local database's life (there is no client-reachable way to
// "unclaim" a person once approved — that's an explicit, documented M5.4
// deferral; see docs/decisions/0009-reviewer-authorization-table.md's
// "next governance dependency" note). Run `npm run supabase:reset` before
// a full e2e run if you need both fixtures available again, and prefer
// running this file in the same pass as claim-workflow.spec.ts rather
// than interleaving repeated partial runs.
//
// Requires SUPABASE_SERVICE_ROLE_KEY in the environment (see
// helpers/reviewer.ts) for every test that needs an authorized-reviewer
// session — there is no client-facing way to become one, by design.
// Tests that only need an authenticated-but-ordinary session (access
// denial, self-review) do not require it.

function uniqueEmailPrefix(tag: string): string {
  return `e2e-review-${tag}`;
}

async function submitClaim(page: Page, personSearchTerm: string, evidence?: string): Promise<void> {
  await page.goto("/member/claim");
  await page.getByLabel("Search by name").fill(personSearchTerm);
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("button", { name: "Select" }).first().click();
  if (evidence) {
    await page.getByLabel("Supporting note (optional)").fill(evidence);
  }
  await page.getByRole("button", { name: "Submit claim" }).click();
  await expect(page.getByText("Your claim has been submitted for review.")).toBeVisible();
}

/**
 * Locates one specific claimant's row in the review queue, scoped by both
 * the claimed person's name and the claimant's email. The queue is shared,
 * non-isolated state across every test in this file — the same seed person
 * ("Ada Lovelace"/"Grace Hopper") can legitimately be claimed by more than
 * one test's claimant before any of them is decided, so matching on name
 * alone risks a Playwright strict-mode violation (multiple rows) or,
 * worse, silently clicking the wrong claimant's row. Scoping by email too
 * makes each lookup deterministic regardless of what earlier tests (or a
 * previous partial run) left behind.
 */
function queueRow(page: Page, personName: string, claimantEmail: string) {
  return page.locator("main ul li", { hasText: personName }).filter({ hasText: claimantEmail });
}

test.describe("Access control", () => {
  test("an authenticated user who is not a reviewer sees a permission-denied state, not the queue", async ({
    page,
  }) => {
    await registerAndConfirm(page, uniqueEmailPrefix("ordinary"));

    // Nav visibility is derived from live reviewer status, not shown to an
    // ordinary account.
    await expect(page.getByRole("link", { name: "Claim review" })).toHaveCount(0);

    await page.goto("/review/claims");
    await expect(page.getByRole("heading", { name: "Claim review" })).toBeVisible();
    await expect(page.getByText("You don't have access to the reviewer area")).toBeVisible();
    // Never the queue itself, and never a claim id enumerated in its place.
    await expect(page.locator("main ul li")).toHaveCount(0);
  });

  test("the permission-denied state also applies to a specific claim id, not just the queue root", async ({
    page,
  }) => {
    await registerAndConfirm(page, uniqueEmailPrefix("ordinary-detail"));

    await page.goto("/review/claims/00000000-0000-0000-0000-000000000000");
    await expect(page.getByText("You don't have access to the reviewer area")).toBeVisible();
  });
});

test.describe("Authorized reviewer — queue, detail, and evidence scoping", () => {
  test("an active reviewer sees the nav link, the queue, and full claim detail including evidence", async ({
    page,
    browser,
  }) => {
    // A separate claimant account and browser context submits a claim
    // first, so the reviewer account below has something real to review.
    const claimantContext = await browser.newContext();
    const claimantPage = await claimantContext.newPage();
    const claimantEmail = await registerAndConfirm(claimantPage, uniqueEmailPrefix("claimant-queue"));
    await submitClaim(claimantPage, "Lovelace", "I corresponded with the PDBFF working group in the 1990s.");
    await claimantContext.close();

    const reviewerEmail = await registerAndConfirm(page, uniqueEmailPrefix("reviewer-queue"));
    const reviewerId = await getUserIdByEmail(reviewerEmail);
    await grantReviewerStatus(reviewerId);

    await page.goto("/member");
    await expect(page.getByRole("link", { name: "Claim review" })).toBeVisible();

    await page.goto("/review/claims");
    await expect(page.getByRole("heading", { name: "Claim review" })).toBeVisible();

    const row = queueRow(page, "Ada Lovelace", claimantEmail);
    await expect(row).toBeVisible();
    await expect(row.getByText("Submitted", { exact: true })).toBeVisible();

    await row.getByRole("link").click();
    await expect(page.getByRole("heading", { name: "Review: Ada Lovelace" })).toBeVisible();

    // The four clearly-separated sections the milestone requires, each its
    // own card — never blended into one fact list.
    await expect(page.getByRole("heading", { name: "Claimant account" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Claimed person record" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Claimant statement" })).toBeVisible();

    // Evidence is visible to the authorized reviewer.
    await expect(
      page.getByText("I corresponded with the PDBFF working group in the 1990s."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Begin review" })).toBeVisible();

    // Never implies name similarity proves identity.
    await expect(page.getByText("Name similarity alone does not confirm identity.")).toBeVisible();
  });
});

test.describe("Self-review denial", () => {
  test("an active reviewer cannot begin review on their own claim", async ({ page }) => {
    const email = await registerAndConfirm(page, uniqueEmailPrefix("self"));
    await submitClaim(page, "Hopper");

    const userId = await getUserIdByEmail(email);
    await grantReviewerStatus(userId);

    await page.goto("/review/claims");
    await queueRow(page, "Grace Hopper", email).getByRole("link").click();
    await page.getByRole("button", { name: "Begin review" }).click();

    await expect(page.getByText("You cannot review your own claim.")).toBeVisible();
  });
});

test.describe("Revoked reviewer", () => {
  test("access is denied immediately once reviewer status is revoked, with no sign-out/sign-in required", async ({
    page,
    browser,
  }) => {
    const email = await registerAndConfirm(page, uniqueEmailPrefix("revoked"));
    const userId = await getUserIdByEmail(email);
    await grantReviewerStatus(userId);

    await page.goto("/review/claims");
    await expect(page.getByRole("heading", { name: "Claim review" })).toBeVisible();
    await expect(page.getByText("You don't have access to the reviewer area")).toHaveCount(0);

    // Revoked by a second, distinct reviewer account (reviewers_no_self_revoke).
    const otherContext = await browser.newContext();
    const otherPage = await otherContext.newPage();
    const otherEmail = await registerAndConfirm(otherPage, uniqueEmailPrefix("revoker"));
    const otherId = await getUserIdByEmail(otherEmail);
    await grantReviewerStatus(otherId);
    await otherContext.close();

    await revokeReviewerStatus(userId, otherId);

    await page.reload();
    await expect(page.getByText("You don't have access to the reviewer area")).toBeVisible();
  });
});

test.describe("Approve workflow — claimant-visible outcome", () => {
  test("approving a claim links the account, and the claimant sees a real, non-fabricated linked state on /member and /account", async ({
    page,
    browser,
  }) => {
    const claimantContext = await browser.newContext();
    const claimantPage = await claimantContext.newPage();
    const claimantEmail = await registerAndConfirm(claimantPage, uniqueEmailPrefix("claimant-approve"));
    await submitClaim(claimantPage, "Lovelace");

    const reviewerEmail = await registerAndConfirm(page, uniqueEmailPrefix("reviewer-approve"));
    const reviewerId = await getUserIdByEmail(reviewerEmail);
    await grantReviewerStatus(reviewerId);

    await page.goto("/review/claims");
    await queueRow(page, "Ada Lovelace", claimantEmail).getByRole("link").click();
    await page.getByRole("button", { name: "Begin review" }).click();
    await expect(page.getByRole("button", { name: "Approve claim" })).toBeVisible();

    // Confirmation dialog: Cancel does not approve.
    await page.getByRole("button", { name: "Approve claim" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Approve this claim?")).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Review: Ada Lovelace" })).toBeVisible();

    // Now actually confirm.
    await page.getByRole("button", { name: "Approve claim" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Approve claim" }).click();

    // role="status" has no accessible name from its own text content (no
    // aria-label), so this is located by its text and confirmed to carry
    // the live-region role separately, rather than via getByRole(name:).
    const successMessage = page.getByText("Claim approved.");
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toHaveAttribute("role", "status");
    await expect(successMessage).toBeFocused();

    // Repeated-decision prevention: reloading the same claim no longer
    // offers any decision action, and shows the recorded decision instead.
    await page.reload();
    await expect(page.getByRole("button", { name: "Approve claim" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Reject claim" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Review decision" })).toBeVisible();
    await expect(page.getByText(/Resulting link:\s*Active/)).toBeVisible();

    await claimantPage.goto("/member");
    await expect(claimantPage.getByText("Your account is linked to Ada Lovelace")).toBeVisible();
    // No fabricated participation/network/publication content.
    const fabricatedMetricPattern =
      /\b\d[\d,]*\+?\s*(participations?|publications?|institutions?|projects?|relationships?|collaborators?|connections?|records?)\b/i;
    await expect(claimantPage.getByText(fabricatedMetricPattern)).toHaveCount(0);

    await claimantPage.goto("/account");
    await expect(claimantPage.getByText("Your account is linked to Ada Lovelace")).toBeVisible();
    // The claimant never sees who reviewed their claim.
    await expect(claimantPage.getByText(reviewerEmail)).toHaveCount(0);

    await claimantContext.close();
  });
});

test.describe("Reject workflow — claimant-visible outcome", () => {
  test("rejecting a claim with a note shows the claimant a calm, neutral outcome and the note, never the reviewer's identity", async ({
    page,
    browser,
  }) => {
    const claimantContext = await browser.newContext();
    const claimantPage = await claimantContext.newPage();
    const claimantEmail = await registerAndConfirm(claimantPage, uniqueEmailPrefix("claimant-reject"));
    await submitClaim(claimantPage, "Hopper");

    const reviewerEmail = await registerAndConfirm(page, uniqueEmailPrefix("reviewer-reject"));
    const reviewerId = await getUserIdByEmail(reviewerEmail);
    await grantReviewerStatus(reviewerId);

    await page.goto("/review/claims");
    await queueRow(page, "Grace Hopper", claimantEmail).getByRole("link").click();
    await page.getByRole("button", { name: "Begin review" }).click();
    await expect(page.getByRole("button", { name: "Reject claim" })).toBeVisible();

    await page.getByRole("button", { name: "Reject claim" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Reject this claim?")).toBeVisible();
    await dialog.getByLabel("Note to claimant (optional)").fill("Name does not match the historical record.");
    await dialog.getByRole("button", { name: "Reject claim" }).click();

    const successMessage = page.getByText("Claim rejected.");
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toHaveAttribute("role", "status");
    await expect(successMessage).toBeFocused();

    await page.reload();
    await expect(page.getByRole("button", { name: "Approve claim" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Reject claim" })).toHaveCount(0);

    await claimantPage.goto("/member");
    await expect(claimantPage.getByText("Your claim on Grace Hopper was not approved")).toBeVisible();
    await expect(claimantPage.getByText(/Reviewer note: Name does not match the historical record\./)).toBeVisible();
    // Calm and neutral: no reviewer email or internal-only detail reaches
    // the claimant.
    await expect(claimantPage.getByText(reviewerEmail)).toHaveCount(0);
    await expect(claimantPage.getByRole("link", { name: "Search again" })).toHaveAttribute(
      "href",
      "/member/claim",
    );

    await claimantContext.close();
  });
});

test.describe("/review/claims — browser quality", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`the queue loads with no console errors, hydration warnings, duplicate ids, or horizontal overflow at 375px (${theme} theme)`, async ({
      page,
    }) => {
      const issues = attachConsoleWatcher(page);
      await page.setViewportSize({ width: 375, height: 812 });

      const email = await registerAndConfirm(page, uniqueEmailPrefix(`quality-${theme}`));
      const userId = await getUserIdByEmail(email);
      await grantReviewerStatus(userId);

      await setStoredTheme(page, theme);
      await page.goto("/review/claims");
      await page.waitForLoadState("networkidle");

      expect(issues, issues.join("\n")).toEqual([]);

      const duplicates = await getDuplicateIds(page);
      expect(duplicates, `duplicate ids: ${duplicates.join(", ")}`).toEqual([]);

      expect(await hasHorizontalOverflow(page)).toBe(false);
    });
  }
});
