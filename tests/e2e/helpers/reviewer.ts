// Grants/revokes reviewer status directly, via a service-role Supabase
// client, to back the M5.4 "authorized reviewer" Playwright coverage in
// claim-review.spec.ts.
//
// This is deliberately the ONLY way these tests are able to construct an
// authorized-reviewer session: per this milestone's own design (see
// docs/decisions/0009-reviewer-authorization-table.md), there is no
// client-facing, app-level path to grant reviewer status at all — only a
// trusted service-role connection may insert into public.reviewers. A
// direct service-role client here plays exactly that "trusted
// service-role connection" role for test setup, the same way this
// milestone's pgTAP coverage (supabase/tests/database/claim_review.test.sql)
// inserts reviewers rows directly as the table owner. It is never used to
// bypass authorization inside the app itself — every assertion still
// exercises the real am_i_a_reviewer()/is_active_reviewer()-gated
// functions through the browser.
//
// Requires SUPABASE_SERVICE_ROLE_KEY to be set in the shell environment
// running Playwright (e.g. exported from your own local, gitignored
// .env.local — run `npm run supabase:status` for the local value). Never
// hardcoded here and never committed anywhere, per "Credentials that must
// never be committed" in docs/supabase-development.md. Tests that need
// this helper fail with a clear, actionable message if the variable is
// not set, rather than an opaque network/auth error.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../../src/types/database.types";

let cachedClient: SupabaseClient<Database> | null = null;

function getServiceRoleClient(): SupabaseClient<Database> {
  if (cachedClient) {
    return cachedClient;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. The M5.4 reviewer-workflow " +
        "Playwright tests need a service-role connection to grant reviewer " +
        "status directly, since there is deliberately no client-facing way " +
        "to do this (see docs/decisions/0009-reviewer-authorization-table.md). " +
        "Add it to .env.local as SUPABASE_SERVICE_ROLE_KEY=<value> (get the " +
        "local value from `npm run supabase:status`) -- playwright.config.ts " +
        "loads .env.local automatically before running `npm run test:e2e`. " +
        "Never commit this value; see docs/supabase-development.md.",
    );
  }

  cachedClient = createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return cachedClient;
}

/** Looks up an account's auth.users id by the email it registered with. */
export async function getUserIdByEmail(email: string): Promise<string> {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    throw new Error(`getUserIdByEmail: ${error.message}`);
  }

  const user = data.users.find((candidate) => candidate.email === email);

  if (!user) {
    throw new Error(`getUserIdByEmail: no account found for ${email}`);
  }

  return user.id;
}

/**
 * Grants active reviewer status to the given account, directly via
 * service-role — the only way this milestone permits it to happen at
 * all. Returns once the row exists, so the caller's next navigation as
 * that account immediately reflects it (every review function re-checks
 * live, per the migration's own documented guarantee).
 */
export async function grantReviewerStatus(userId: string): Promise<void> {
  const supabase = getServiceRoleClient();
  const { error } = await supabase.from("reviewers").insert({ user_id: userId, status: "active" });

  if (error) {
    throw new Error(`grantReviewerStatus: ${error.message}`);
  }
}

/**
 * Revokes a reviewer's status, directly via service-role — backs the
 * "revoked reviewer is denied immediately" coverage. `revokedByUserId`
 * must be a different account than `userId`: reviewers_no_self_revoke
 * rejects a row where they're equal, by design.
 */
export async function revokeReviewerStatus(userId: string, revokedByUserId: string): Promise<void> {
  const supabase = getServiceRoleClient();
  const { error } = await supabase
    .from("reviewers")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
      revoked_by_user_id: revokedByUserId,
    })
    .eq("user_id", userId);

  if (error) {
    throw new Error(`revokeReviewerStatus: ${error.message}`);
  }
}
