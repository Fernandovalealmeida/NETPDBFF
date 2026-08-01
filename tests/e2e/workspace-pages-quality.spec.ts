import { expect, test, type Page } from "@playwright/test";

import { attachConsoleWatcher, getDuplicateIds, hasHorizontalOverflow, setStoredTheme } from "./helpers/page-quality";
import { waitForConfirmationLink } from "./helpers/mailpit";

// Automated browser-quality pass for the M5.2 workspace pages (/member,
// /account). Deliberately leaner than auth-pages-quality.spec.ts's
// per-page/per-theme matrix: console errors, duplicate ids, and horizontal
// overflow are checked together in one test per theme instead of three
// separate tests, since a real regression in any one of them is just as
// informative found alongside the others. Existing coverage in
// register.spec.ts, login.spec.ts, update-password.spec.ts, and
// protected-routes.spec.ts (confirmation banner text, email visibility,
// "not yet connected" wording, "Account → Security" text, redirect
// behavior, logout) is not re-asserted here — this file only adds checks
// those files don't already make.

async function registerAndConfirm(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create account" }).click();

  const confirmLink = await waitForConfirmationLink(email);
  await page.goto(confirmLink);
}

function uniqueCredentials(tag: string): { email: string; password: string } {
  return { email: `e2e-quality-${tag}-${Date.now()}@example.com`, password: "correcthorse1" };
}

for (const path of ["/member", "/account"] as const) {
  test.describe(`${path} — browser quality`, () => {
    for (const theme of ["light", "dark"] as const) {
      test(`loads with no console errors, hydration warnings, duplicate ids, or horizontal overflow at 375px (${theme} theme)`, async ({
        page,
      }) => {
        const { email, password } = uniqueCredentials(`${path.slice(1)}-${theme}`);
        const issues = attachConsoleWatcher(page);
        await setStoredTheme(page, theme);
        await page.setViewportSize({ width: 375, height: 812 });

        await registerAndConfirm(page, email, password);
        await page.goto(path);
        await page.waitForLoadState("networkidle");

        expect(issues, issues.join("\n")).toEqual([]);

        const duplicates = await getDuplicateIds(page);
        expect(duplicates, `duplicate ids: ${duplicates.join(", ")}`).toEqual([]);

        expect(await hasHorizontalOverflow(page)).toBe(false);
      });
    }
  });
}

test.describe("/member — accessible structure and honest empty state", () => {
  test("has one h1, a real account summary, and a non-interactive future action — no fabricated domain data", async ({
    page,
  }) => {
    const { email, password } = uniqueCredentials("member-content");
    await registerAndConfirm(page, email, password);
    await page.goto("/member");

    // Exactly one h1 ("Member area"), consistent with the single-main-landmark,
    // no-skipped-levels requirement — Card's "Your account" is a genuine h2
    // beneath it, not a second h1.
    await expect(page.getByRole("heading", { level: 1, name: "Member area" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Your account" })).toBeVisible();

    // The empty state and its future action are honest, not fabricated
    // functionality: no link or button named "Claim a person record" exists
    // (FutureAction renders an inert <span>), only the inert label + badge.
    await expect(page.getByText("Not yet connected to a NetPDBFF person record")).toBeVisible();
    await expect(page.getByRole("link", { name: "Claim a person record" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Claim a person record" })).toHaveCount(0);

    // Core constraint is "no fabricated domain data," not "never mention
    // future functionality" — the EmptyState's own description legitimately
    // says "everything about PDBFF participants, participation history, and
    // the network" to honestly explain what's deferred (see
    // src/app/(protected)/member/page.tsx). Banning that vocabulary
    // outright would fail on the page's own honest copy. What must never
    // appear is a fabricated *record* or *metric*: a number attached to one
    // of these domain nouns (e.g. "3 publications", "12 collaborators" — an
    // implied count of data that doesn't exist) or list/table markup
    // presenting example entries as if they were real records.
    const fabricatedMetricPattern =
      /\b\d[\d,]*\+?\s*(participations?|publications?|institutions?|projects?|relationships?|collaborators?|connections?|records?)\b/i;
    await expect(page.getByText(fabricatedMetricPattern)).toHaveCount(0);
    await expect(
      page.locator("main table, main [role='table'], main [role='list'], main ul, main ol"),
    ).toHaveCount(0);
  });
});

test.describe("/account — accessible structure and honest empty state", () => {
  test("has one h1, the real account facts, and a non-interactive future action — no new account functionality", async ({
    page,
  }) => {
    const { email, password } = uniqueCredentials("account-content");
    await registerAndConfirm(page, email, password);
    await page.goto("/account");

    await expect(page.getByRole("heading", { level: 1, name: "Account" })).toBeVisible();

    // Real, current facts only — no fabricated profile content.
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText("Email confirmed")).toBeVisible();
    await expect(page.getByText("Account created")).toBeVisible();

    // "Account → Security" is an honest placeholder, not a real destination
    // or a "Change password" affordance. The phrase now appears twice by
    // design (EmptyState's description sentence + the FutureAction label),
    // so — same fix as update-password.spec.ts — target the FutureAction
    // element itself via its `aria-disabled` marker rather than relying on
    // the text being unique.
    await expect(page.locator('[aria-disabled="true"]', { hasText: "Account → Security" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Account → Security" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Account → Security" })).toHaveCount(0);

    // No profile editing, identity claiming, or account-deletion affordances.
    await expect(page.getByRole("button", { name: /delete account/i })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /edit profile/i })).toHaveCount(0);
  });
});
