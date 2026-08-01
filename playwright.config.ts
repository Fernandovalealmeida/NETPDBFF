import { defineConfig, devices } from "@playwright/test";

// Playwright is an isolated devDependency (not part of the app's runtime or
// build graph — see tsconfig.json's `exclude`) used only for these
// browser-level tests. It's the tool Supabase's own docs and this
// milestone's brief recommend for this kind of flow.
//
// These tests require BOTH:
//   1. The local Supabase stack running (`npm run supabase:start`) —
//      specifically Auth and Mailpit.
//   2. The Next.js dev server (started automatically below via `webServer`,
//      or already running via `npm run dev`).
// They are not run as part of `npm run lint`/`typecheck`/`build`, and they
// are not hosted-project-dependent — see
// docs/authentication-implementation.md, "Automated tests".
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    // Was "on-first-retry", which never fires with retries: 0 above — no
    // trace was ever produced for a failing run, which is why the exact
    // failure point of the /login timeout couldn't be inspected. This
    // records a trace and screenshot for any test that fails on its only
    // attempt, without touching test assertions/timeouts/retries.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
