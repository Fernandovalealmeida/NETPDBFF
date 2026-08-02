// Types for the M5.3 identity-claiming feature. No "use server" here (see
// src/features/auth/actions/state.ts's file comment for why action-state
// modules stay plain) — this file is imported by both server and client
// code, so it must stay a types-and-pure-values-only module.

/**
 * The exact controlled vocabulary from `profile_claims.status`
 * (supabase/migrations/20260801013649_create_identity_foundation.sql,
 * `profile_claims_status_valid`). Never invent a status value beyond this
 * set — see docs/database-schema.md's "Profile claims" status table.
 */
export type ClaimStatus = "submitted" | "under_review" | "approved" | "rejected" | "withdrawn";

export const CLAIM_STATUSES: readonly ClaimStatus[] = [
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "withdrawn",
] as const;

export function isClaimStatus(value: unknown): value is ClaimStatus {
  return typeof value === "string" && (CLAIM_STATUSES as readonly string[]).includes(value);
}

/** One row of the claimant's own claim history, as read from `profile_claims`. */
export interface ClaimRecord {
  id: string;
  personId: string;
  status: ClaimStatus;
  submittedAt: string;
  decidedAt: string | null;
}

/**
 * The claimant-facing derived view of "where do I stand," combining
 * `profile_claims` history into the single most relevant state per
 * docs/application-information-architecture.md's requirement that
 * `/member` distinguish: no claim, pending, approved, rejected, withdrawn.
 * Never includes `decision_notes` or any reviewer/administrative field —
 * see src/features/identity/status.ts for what's deliberately left out.
 */
export type IdentityStatus =
  | { kind: "no_claim" }
  | { kind: "pending"; claim: ClaimRecord; personDisplayName: string | null }
  | { kind: "approved"; claim: ClaimRecord; personDisplayName: string | null }
  | { kind: "rejected"; claim: ClaimRecord; personDisplayName: string | null }
  | { kind: "withdrawn"; claim: ClaimRecord; personDisplayName: string | null };

/** One eligible search/browse result from `search_claimable_people`. */
export interface ClaimablePerson {
  id: string;
  displayName: string;
}
