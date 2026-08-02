import { expect, test, type Page } from "@playwright/test";

import { registerAndConfirm } from "./helpers/auth";
import { assertNoSeriousOrCriticalViolations, runAccessibilityScan } from "./helpers/accessibility";
import { setStoredTheme } from "./helpers/page-quality";
import { getUserIdByEmail, grantReviewerStatus } from "./helpers/reviewer";

// M5.5 automated accessibility pass (docs/m5-application-ui-design-system.md
// item 10's acceptance criterion: "automated axe-core-based checks ...
// report no critical/serious violations on every redesigned page, in both
// themes"). This file is additive to, not a replacement for, the existing
// manual/targeted browser-quality coverage in auth-pages-quality.spec.ts
// and workspace-pages-quality.spec.ts (console errors, hydration warnings,
// duplicate ids, horizontal overflow, keyboard focus) -- axe catches a
// different, complementary category of defect (landmarks, heading order,
// label/description wiring, contrast, ARIA validity) that those checks
// were never meant to cover, and none of those existing tests are changed
// or weakened here.
//
// Every route below is reached through the real, unmodified app: real
// registration + Mailpit confirmation (helpers/auth.ts), real reviewer
// grants via the same trusted service-role helper claim-review.spec.ts
// already uses (helpers/reviewer.ts), real claim submission through the
// actual /member/claim form. Nothing here bypasses route authorization or
// fabricates account/claim/reviewer state outside those sanctioned
// mechanisms -- an unauthorized state is never scanned "for convenience."

function uniqueEmailPrefix(tag: string): string {
  return `e2e-a11y-${tag}`;
}

async function submitClaim(page: Page, personSearchTerm: string): Promise<void> {
  await page.goto("/member/claim");
  await page.getByLabel("Search by name").fill(personSearchTerm);
  await page.getByRole("button", { name: "Search" }).click();
  await page.getByRole("button", { name: "Select" }).first().click();
  await page.getByRole("button", { name: "Submit claim" }).click();
  await expect(page.getByText("Your claim has been submitted for review.")).toBeVisible();
}

async function scanCurrentPage(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  const violations = await runAccessibilityScan(page);
  assertNoSeriousOrCriticalViolations(violations);
}

const THEMES = ["light", "dark"] as const;

// --- Public routes -----------------------------------------------------

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/auth/error"] as const;

for (const path of PUBLIC_ROUTES) {
  test.describe(`Accessibility: ${path} (public)`, () => {
    for (const theme of THEMES) {
      test(`no critical/serious axe violations (${theme} theme)`, async ({ page }) => {
        await setStoredTheme(page, theme);
        await page.goto(path);
        await scanCurrentPage(page);
      });
    }
  });
}

// --- Authenticated workspace routes -------------------------------------

const WORKSPACE_ROUTES = ["/member", "/account", "/member/claim"] as const;

for (const path of WORKSPACE_ROUTES) {
  test.describe(`Accessibility: ${path} (authenticated)`, () => {
    for (const theme of THEMES) {
      test(`no critical/serious axe violations (${theme} theme)`, async ({ page }) => {
        await setStoredTheme(page, theme);
        await registerAndConfirm(page, uniqueEmailPrefix(`${path.slice(1).replace(/\//g, "-")}-${theme}`));
        await page.goto(path);
        await scanCurrentPage(page);
      });
    }
  });
}

// --- /update-password (gated state) -------------------------------------
//
// Same reachability rule as auth-pages-quality.spec.ts: an authenticated
// account with no recovery-flow hint cookie lands on the "Reset link
// required" state -- the one state reachable without driving a full
// Mailpit recovery-email round trip, which update-password.spec.ts already
// covers functionally. "legitimately reachable in the tested state," per
// this milestone's brief, is exactly this state for an automated pass.

test.describe("Accessibility: /update-password (gated state)", () => {
  for (const theme of THEMES) {
    test(`no critical/serious axe violations (${theme} theme)`, async ({ page }) => {
      await setStoredTheme(page, theme);
      await registerAndConfirm(page, uniqueEmailPrefix(`update-password-${theme}`));
      await page.goto("/update-password");
      await expect(page.getByRole("heading", { name: "Reset link required" })).toBeVisible();
      await scanCurrentPage(page);
    });
  }
});

// --- Reviewer routes -----------------------------------------------------

test.describe("Accessibility: /review/claims (reviewer, queue with content)", () => {
  for (const theme of THEMES) {
    test(`no critical/serious axe violations (${theme} theme)`, async ({ page, browser }) => {
      // A separate claimant/context submits a claim first so the queue
      // scanned below has real list content, not just the empty state --
      // both are legitimate, but the list markup (Badge, per-row link) is
      // the richer surface worth scanning.
      //
      // "Hopper", not "Lovelace": supabase/seed.sql seeds exactly two
      // `people` rows for the whole suite, and claim-review.spec.ts's
      // "Approve workflow" test permanently removes Lovelace from
      // search_claimable_people's results the moment it runs (an approved
      // claim creates a real, non-reversible user_person_links row -- see
      // that file's own comment). Nothing in this suite ever approves a
      // claim on Hopper (only rejects, which doesn't affect claimability),
      // so she's the one search term every test in this file can rely on
      // regardless of Playwright's worker-scheduling order relative to
      // claim-review.spec.ts. Matches the /review/claims/[claimId] test
      // below, which already uses "Hopper" for the same reason.
      const claimantContext = await browser.newContext();
      const claimantPage = await claimantContext.newPage();
      await registerAndConfirm(claimantPage, uniqueEmailPrefix(`queue-claimant-${theme}`));
      await submitClaim(claimantPage, "Hopper");
      await claimantContext.close();

      const reviewerEmail = await registerAndConfirm(page, uniqueEmailPrefix(`queue-reviewer-${theme}`));
      const reviewerId = await getUserIdByEmail(reviewerEmail);
      await grantReviewerStatus(reviewerId);

      await setStoredTheme(page, theme);
      await page.goto("/review/claims");
      await expect(page.getByRole("heading", { name: "Claim review" })).toBeVisible();
      await scanCurrentPage(page);
    });
  }
});

test.describe("Accessibility: /review/claims/[claimId] (reviewer, submitted-claim detail)", () => {
  for (const theme of THEMES) {
    test(`no critical/serious axe violations (${theme} theme)`, async ({ page, browser }) => {
      const claimantContext = await browser.newContext();
      const claimantPage = await claimantContext.newPage();
      const claimantEmail = await registerAndConfirm(claimantPage, uniqueEmailPrefix(`detail-claimant-${theme}`));
      await submitClaim(claimantPage, "Hopper");
      await claimantContext.close();

      const reviewerEmail = await registerAndConfirm(page, uniqueEmailPrefix(`detail-reviewer-${theme}`));
      const reviewerId = await getUserIdByEmail(reviewerEmail);
      await grantReviewerStatus(reviewerId);

      await setStoredTheme(page, theme);
      await page.goto("/review/claims");
      await page
        .locator("main ul li", { hasText: "Grace Hopper" })
        .filter({ hasText: claimantEmail })
        .getByRole("link")
        .click();
      await expect(page.getByRole("heading", { name: "Review: Grace Hopper" })).toBeVisible();
      await scanCurrentPage(page);
    });
  }
});

// --- Reviewer confirmation dialogs ---------------------------------------
//
// Covers this milestone's "dialog names and descriptions" and "reviewer
// confirmation dialogs" verification requirement. Both dialogs are opened
// and scanned, then cancelled -- never confirmed -- so this never actually
// approves/rejects a claim and never permanently consumes one of the two
// shared seed.sql people fixtures the way claim-review.spec.ts's decision
// tests deliberately do. Single theme (light) is sufficient here: the
// dialog is the same Radix Dialog primitive already scanned for contrast
// across every other theme'd route above, so the only new surface this
// adds is the open-dialog DOM structure (title/description wiring,
// role="dialog", focus trap), not theme-specific styling.

test.describe("Accessibility: reviewer confirmation dialogs", () => {
  test("Approve and Reject confirmation dialogs have no critical/serious axe violations", async ({
    page,
    browser,
  }) => {
    // "Hopper", not "Lovelace" -- see the identical reasoning in the
    // "/review/claims (reviewer, queue with content)" test above. This
    // test in particular must never approve/reject for real (it only
    // opens each dialog and cancels), so it doesn't consume Hopper's
    // claimability either -- she remains available to every later test.
    const claimantContext = await browser.newContext();
    const claimantPage = await claimantContext.newPage();
    const claimantEmail = await registerAndConfirm(claimantPage, uniqueEmailPrefix("dialog-claimant"));
    await submitClaim(claimantPage, "Hopper");
    await claimantContext.close();

    const reviewerEmail = await registerAndConfirm(page, uniqueEmailPrefix("dialog-reviewer"));
    const reviewerId = await getUserIdByEmail(reviewerEmail);
    await grantReviewerStatus(reviewerId);

    await page.goto("/review/claims");
    await page
      .locator("main ul li", { hasText: "Grace Hopper" })
      .filter({ hasText: claimantEmail })
      .getByRole("link")
      .click();
    await page.getByRole("button", { name: "Begin review" }).click();
    await expect(page.getByRole("button", { name: "Approve claim" })).toBeVisible();

    // Approve confirmation dialog.
    await page.getByRole("button", { name: "Approve claim" }).click();
    const approveDialog = page.getByRole("dialog");
    await expect(approveDialog.getByText("Approve this claim?")).toBeVisible();
    const approveViolations = await runAccessibilityScan(page);
    assertNoSeriousOrCriticalViolations(approveViolations);
    await approveDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(approveDialog).toHaveCount(0);

    // Reject confirmation dialog -- same claim, still under_review, since
    // Cancel above never decided it.
    await page.getByRole("button", { name: "Reject claim" }).click();
    const rejectDialog = page.getByRole("dialog");
    await expect(rejectDialog.getByText("Reject this claim?")).toBeVisible();
    const rejectViolations = await runAccessibilityScan(page);
    assertNoSeriousOrCriticalViolations(rejectViolations);
    await rejectDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(rejectDialog).toHaveCount(0);
  });
});
