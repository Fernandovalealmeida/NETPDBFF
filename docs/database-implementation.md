# Database Implementation — Milestone M3.1: Identity Foundation

## Status

This document describes the first real migration, applied against the
design in `docs/database-schema.md`, `docs/database-model.md`,
`docs/privacy-model.md`, and
`docs/decisions/0001-separate-people-from-user-accounts.md`. It covers
what M3.1 actually built, where it deliberately narrows or deviates from
the fuller schema document, and what is left for M3.2+.

**Revision note.** The migration and this document went through one
security/identity revision pass before ever being run locally. Four
issues were addressed: `is_deceased` was changed from a generated
column to an independently stored fact (people can be known deceased
with an unknown date); "no simultaneously approved claims" is now
enforced directly on `profile_claims` via unique indexes rather than a
trigger that only checked `user_person_links` (which had a real gap —
see below); claim withdrawal no longer uses a row-level `UPDATE`
policy, which could not restrict which *columns* a claimant could
change, and instead uses a narrowly-scoped function; and
`user_person_links.source_claim_id` is now unique, so an approved claim
can never back more than one link. Each is described in its relevant
section below with the reasoning, not just the outcome.

## Migration created

`supabase/migrations/20260801013649_create_identity_foundation.sql`

Created by hand rather than via `supabase migration new`: the Supabase
CLI binary has no published build for this sandbox's platform
(`linux-arm64`), and Docker is not available here either, matching the
limitation already noted in `docs/supabase-development.md`. The file
follows the CLI's own naming convention
(`<UTC timestamp>_<name>.sql`) so it will be picked up normally by
`supabase db reset` / `supabase db push` once run from a machine with
the CLI and Docker available. No extensions were added —
`gen_random_uuid()` is built into PostgreSQL 17 (see
`supabase/config.toml`, `db.major_version = 17`), so `pgcrypto`/
`uuid-ossp` are not needed for primary keys.

## Tables implemented

### `people`

Represents a historical or current person, independent of `auth.users`.
Columns: `id`, `given_name`, `family_name`, `preferred_name`,
`display_name`, `biography`, `date_of_birth`, `date_of_death`,
`is_deceased` (independently stored boolean), `verification_status`,
`source_type`, `created_by_user_id`, `created_at`, `updated_at`.

**Field-name mapping against the milestone brief** (the brief's names on
the left, `docs/database-schema.md`'s names — which this migration
uses — on the right):

| Brief | Implemented |
|---|---|
| `first_name` | `given_name` |
| `last_name` | `family_name` |
| `person_verification_status` | `verification_status` |
| `is_deceased` (plain boolean) | `is_deceased boolean not null default false`, plus nullable `date_of_birth`/`date_of_death` |

**Revision: `is_deceased` is no longer a generated column.** The first
draft of this migration derived `is_deceased` from `date_of_death is
not null`, reasoning that a second, independently-settable fact could
drift from the date. That was wrong for NetPDBFF's actual data: PDBFF's
historical record includes people known to have died without a
documented date (an old roster note, a secondhand account, an obituary
with no date given) — a case a generated column cannot represent at
all, since it forces "deceased" to imply "date known." `is_deceased` is
now `boolean not null default false`, and `date_of_death` stays
nullable and independent. Two `CHECK` constraints keep the two facts
consistent without conflating them:

- `people_date_of_death_requires_deceased`: `date_of_death is null or
  is_deceased` — a death date can't exist on a record marked not
  deceased.
- `people_death_after_birth` (unchanged): `date_of_death >=
  date_of_birth` when both are known.

Deliberately *not* added: a constraint requiring `date_of_death` when
`is_deceased = true`. That's the entire point of splitting the two
columns — "known deceased, date unknown" must remain representable.

**Deliberate omissions from the brief's suggested field list:**

- `middle_names` — not part of `docs/database-schema.md`'s `people`
  entry. Adding it would introduce a new field storing personal data
  without the visibility-level decision `CLAUDE.md` requires before
  that happens. Omitted; flagged for product-owner sign-off if wanted.
- `merged_into_person_id` — present in the full schema, but it exists
  to support the duplicate/merge workflow (`duplicate_candidates`),
  which is out of this milestone's scope entirely. Adding a nullable
  self-FK with no surrounding workflow would be exactly the kind of
  speculative structure the brief says to avoid. Deferred to whichever
  milestone builds merge/duplicate handling.
- `source_type` was added even though the brief's list didn't mention
  it, because `docs/database-schema.md` marks it as a **required**
  field on `people` and it's the backbone of the schema-wide Provenance
  Model. Left out, `people` rows would have no way to record whether a
  record is self-reported vs. imported — a core requirement of this
  milestone's own objective.

Constraints: non-empty/non-whitespace checks on all name fields;
`verification_status` and `source_type` each constrained to their
documented enum; `date_of_death >= date_of_birth` when both present.
Indexes: `verification_status`, `created_by_user_id`. No trigram/search
index yet — no search feature exists to justify it (avoiding
speculative indexes, per the brief).

### `profile_claims`

A user's request to claim a `people` row.
Columns: `id`, `claimant_user_id`, `claimed_person_id`, `status`,
`supporting_evidence`, `reviewer_admin_id`, `decision_notes`,
`submitted_at`, `decided_at`, `created_at`, `updated_at`.

**Mapping:** brief's `user_id` → `claimant_user_id`; `person_id` →
`claimed_person_id`; `reviewed_by_user_id` → `reviewer_admin_id`;
`reviewed_at` → `decided_at`; `rejection_reason`/`claimant_message` →
`decision_notes`/`supporting_evidence` (the schema's names are broader:
`decision_notes` covers any reviewer note, not only rejections;
`supporting_evidence` covers whatever the claimant submits, not only a
message).

Status values and transitions follow the "Profile claims" table in
`docs/database-schema.md` exactly: `submitted → under_review →
approved | rejected`, plus claimant-initiated `withdrawn` from
`submitted`/`under_review`.

Constraints/enforcement:

- No more than one pending (`submitted`/`under_review`) claim per
  `(claimant_user_id, claimed_person_id)` pair — partial unique index
  (`profile_claims_one_active_pair_idx`).
- `decided_at` is set exactly when `status` is terminal
  (`approved`/`rejected`/`withdrawn`) — `CHECK`.
- `reviewer_admin_id` required when `status` is `approved`/`rejected` —
  `CHECK`.
- Self-approval blocked — `CHECK (reviewer_admin_id IS NULL OR
  reviewer_admin_id <> claimant_user_id)`.
- Claim rows are never deleted — no `DELETE` grant/policy exists for
  any client role.

**Revision: "no simultaneously approved claims" is now enforced
directly on `profile_claims`, not via `user_person_links`.** The first
draft used a `BEFORE INSERT OR UPDATE OF status` trigger
(`profile_claims_guard_approval`) that rejected approving a claim if
the claimant already held an *active* `user_person_links` row. That had
a real gap: approving a claim and creating its link are two separate
steps, and the trigger only looked at links that already existed. If
claim A for user X was approved but its link hadn't been created yet,
nothing stopped a second claim B for the same user X from also being
approved in the meantime — the trigger would find no active link and
let it through, producing two approved claims for one user with
neither link yet created. The trigger (and its function) have been
removed entirely and replaced with two partial unique indexes on
`profile_claims` itself, which check the fact directly instead of
inferring it from a downstream table:

- `profile_claims_one_approved_per_claimant_idx` — unique on
  `claimant_user_id` where `status = 'approved'`.
- `profile_claims_one_approved_per_person_idx` — unique on
  `claimed_person_id` where `status = 'approved'`.

The second index (one approved claimant per person) goes beyond what
the brief asked for verbatim, per its own instruction to evaluate this
and default to the conservative rule absent a clear reason otherwise.
`docs/database-schema.md`'s `user_person_links` design already assumes
a person is actively linked to at most one account under "the initial
model," so a second, simultaneously approved claim on the same person
would be inconsistent with that design even before any link exists —
the conservative rule matches the architecture rather than contradicts
it.

**Flagged for product-owner confirmation:** because `profile_claims`
rows are never un-approved (approval is a terminal state per the Status
Models table in `docs/database-schema.md`), these two indexes mean that
once a claim is approved for a given claimant or person, no *other*
claim for that same claimant/person can ever become approved again —
even long after the resulting `user_person_links` row is revoked. If
"revoke the link, then approve a corrected claim for the same
person/user" needs to be a supported workflow, this will need
revisiting (most likely: an admin-only path that also reverts the old
claim to a non-approved status before a new one can be approved). Not
addressed here since it wasn't asked for and would be speculative.

**Revision: claim withdrawal no longer uses an `UPDATE` RLS policy.**
The first draft granted `authenticated` `UPDATE` on `profile_claims`
and relied on a policy restricting it to the claimant's own row while
pending, with a `WITH CHECK` limiting the new `status` to `withdrawn`.
That was insufficient: RLS `USING`/`WITH CHECK` clauses constrain which
*rows* an `UPDATE` may touch and what the *final row* must look like —
they say nothing about which *columns* the same statement is allowed to
change. A claimant could legally run `UPDATE profile_claims SET status
= 'withdrawn', claimed_person_id = <someone else>, reviewer_admin_id =
<self>, decision_notes = 'approved', submitted_at = <backdated> WHERE
...` — as long as the final row's `claimant_user_id` and `status`
satisfied the policy, every other column was fair game in the same
statement. Column-level `GRANT UPDATE (status) ON ...` was considered
next, but rejected too: it still leaves a raw, client-issued `UPDATE`
statement as the attack surface, and its interaction with RLS policy
evaluation is a known source of subtle mistakes (a `WITH CHECK` clause
still evaluates against the *whole* row, not just the granted column).

The implemented design (option 2 from the request — smallest attack
surface): `authenticated` has **no `UPDATE` grant on `profile_claims`
at all**. The only way to withdraw a claim is
`public.withdraw_profile_claim(p_claim_id uuid)`, a `SECURITY DEFINER`
function with a pinned `search_path` (to avoid the standard
`SECURITY DEFINER` search-path-hijack pitfall) that:

- runs a single `UPDATE` touching exactly two columns — `status` and
  `decided_at` — and no others, ever, regardless of what the caller
  passes in (the function takes only a claim id as an argument; there
  is no column-value input at all);
- enforces `claimant_user_id = auth.uid()` and `status IN ('submitted',
  'under_review')` in its own `WHERE` clause, so ownership and the
  allowed source states are checked by the function itself rather than
  delegated to RLS (`SECURITY DEFINER` bypasses RLS on the table it
  touches, so the function *must* enforce this itself, and does);
- always sets the target state to `'withdrawn'` — there is no code path
  that can move a claim from `withdrawn` back to `submitted`/
  `under_review`, satisfying "no reversal" structurally rather than by
  convention;
- raises an exception (caught as a normal Postgres error, SQLSTATE
  `P0001`) if the claim doesn't exist, isn't owned by the caller, or
  isn't in a withdrawable state — it does not silently no-op.

`authenticated` is granted `EXECUTE` on this function only. This closes
the column-tampering surface completely rather than narrowing it: there
is no `UPDATE` statement of any shape that `authenticated` can issue
against `profile_claims` any more.

### `user_person_links`

The authoritative link between an `auth.users` row and a `people` row.
Columns: `id`, `user_id`, `person_id`, `status`, `linked_at`,
`revoked_at`, `revoked_reason`, `source_claim_id`, `linked_by_user_id`,
`created_at`.

**Mapping:** brief's `approved_claim_id` → `source_claim_id` (the name
already used in `docs/database-schema.md`).

**Flagged addition:** `linked_by_user_id` is **not** in
`docs/database-schema.md`'s `user_person_links` entry. It was added
because the milestone brief explicitly asked for it, and because it's a
nullable provenance column consistent with the schema's own
Provenance Model pattern applied everywhere else ("who submitted it").
This is called out here, rather than added silently, so it can be
confirmed or reverted before it's relied on elsewhere. It is *not*
treated as a contradiction of the approved architecture — it doesn't
change any relationship, constraint, or existing column, only adds an
optional attribution field.

Constraints/enforcement:

- At most one *active* link per `user_id`, and at most one active link
  per `person_id` — two partial unique indexes, implementing "one user
  ↔ one person" for the initial model.
- `revoked_at` set exactly when `status = 'revoked'` — `CHECK`.
- Referential integrity to the approving claim: a
  `BEFORE INSERT OR UPDATE` trigger
  (`user_person_links_validate_source_claim`) rejects any
  `source_claim_id` that doesn't point at an `approved` claim for the
  *same* `user_id`/`person_id` pair.
- **New:** `source_claim_id` is unique
  (`user_person_links_source_claim_id_idx`, a plain — not partial —
  unique index). A given approved claim can back at most one link,
  ever; it cannot be reused to authorize a second link even after the
  first is revoked. NULLs are exempt from uniqueness under normal
  Postgres semantics, so this doesn't require a partial predicate.
- No `INSERT`/`UPDATE` policy exists for `anon`/`authenticated` — links
  are created only by trusted server-side (service-role) code, per the
  brief's explicit requirement.

### `audit_logs`

A narrow, append-only log — explicitly **not** the full framework
`docs/database-schema.md` describes (which adds `before_state`/
`after_state`/`reason`). Columns: `id`, `actor_user_id`, `action`,
`subject_type`, `subject_id`, `subject_label`, `metadata` (jsonb),
`occurred_at`.

**Mapping:** brief's `entity_type`/`entity_id`/`entity_label_snapshot`/
`created_at` → schema's `subject_type`/`subject_id`/`subject_label`/
`occurred_at`. `metadata jsonb` is a deliberate simplification of the
full schema's `before_state`/`after_state`/`reason` split, matching the
brief's own instruction not to build the complete audit framework yet.

`subject_id` intentionally has no foreign key — same justification as
`docs/database-schema.md` gives: an audit row must outlive its subject
(a merge, a rejection, an eventual deletion), and the required
`subject_label` snapshot compensates for the lost referential
integrity. Append-only is enforced by having no `UPDATE`/`DELETE`
policy or grant for any client role — per the schema doc's own note,
this is "by convention," not a hard DB constraint, even for
`service_role`.

## Row Level Security model

Every new table has `ENABLE ROW LEVEL SECURITY`. There is no
administrator-role table yet, so — per the milestone brief — no
insecure client-side "is admin" shortcut was introduced anywhere.
Administrative actions (claim approval/rejection, link creation, audit
writes) are expected to run through trusted server-side code using the
`service_role` key until a real role system exists. This is a known,
explicitly-scoped limitation, not an oversight.

**A GRANT-layer note that matters for anyone extending this:**
`supabase/config.toml` does not set `api.auto_expose_new_tables`, which
per its own inline comment means new public-schema tables get **no**
privileges for `anon`/`authenticated`/`service_role` without an
explicit `GRANT` — RLS policies alone do nothing if the role can't
reach the table at all, and `service_role`'s `BYPASSRLS` attribute only
skips policy checks, not the privilege system. Concretely:

- `service_role` is granted full `SELECT`/`INSERT`/`UPDATE`/`DELETE` on
  all four tables, so server-side admin code actually works.
- `authenticated` is granted `SELECT`/`INSERT`  (not `UPDATE`) on
  `profile_claims`, plus `EXECUTE` on `withdraw_profile_claim(uuid)` —
  see the revision note in the `profile_claims` section above for why
  `UPDATE` was removed entirely rather than narrowed.
- `people`, `user_person_links`, and `audit_logs` get **no grant at
  all** to `anon`/`authenticated` — combined with having zero policies,
  this is a deliberate two-layer deny, stronger than RLS alone. A
  future migration that opens any client-side read (e.g. public
  `display_name` once `profile_visibility_settings` exists) must add
  *both* the `GRANT` and the policy — adding only one will not restore
  access.

Policy/function summary:

| Table | anon | authenticated | service_role |
|---|---|---|---|
| `people` | no access | no access | full (bypasses RLS) |
| `profile_claims` | no access | select/insert own rows only; no `UPDATE` grant at all; may withdraw their own pending claim only by calling `withdraw_profile_claim()` | full |
| `user_person_links` | no access | no access | full |
| `audit_logs` | no access | no access | full |

This is intentionally more restrictive than the eventual product —
`docs/privacy-model.md` expects `display_name` to be public for
verified people — but `profile_visibility_settings` (the mechanism that
would decide *which* fields are public) doesn't exist yet, and building
it wasn't in scope for this milestone. Treat the fully-locked `people`
table as a known follow-up, not a final state.

One design decision beyond the brief's explicit list: `authenticated`
users may withdraw their **own** claim (transition it to `withdrawn`)
while it is `submitted` or `under_review`, via
`withdraw_profile_claim()`. The brief's RLS requirements list didn't
spell this out, but `docs/database-schema.md`'s own status table
explicitly documents `submitted | under_review → withdrawn
(claimant-initiated only)` — without this function, that documented
transition would have no path to happen at all except through
service-role code standing in for the user. Flagging this here in case
it should be reconsidered.

## Admin-review limitation

There is no administrator-role table in this milestone. Every action
that requires "an admin decided this" (claim approval/rejection, link
creation) can currently only be performed through code running with the
`service_role` key (i.e., trusted server-side routes), never a signed-in
user's session. This matches the brief's explicit instruction not to
invent a temporary insecure admin policy. When a real role system is
designed, `profile_claims`/`user_person_links` policies will need
revisiting to allow a genuine admin role to act directly.

## Running the local database tests

```bash
npm install
npx supabase init            # only if supabase/ hasn't been initialized locally yet — it already exists in this repo, skip if so
npm run supabase:start        # boots local Postgres/Auth/Storage via Docker
npm run supabase:reset        # applies all migrations from a clean state
npm run supabase:test         # supabase test db — runs supabase/tests/database/*.test.sql via pgTAP
```

Tests live in `supabase/tests/database/identity_foundation.test.sql`
(pgTAP, 33 assertions). **These have not been executed** — this
environment has no Docker and no platform-compatible `supabase` CLI
binary (`linux-arm64` has no published build), which is the same
limitation `docs/supabase-development.md` already documents. Please run
`npm run supabase:test` yourself and treat the migration as unverified
until that passes.

Two things worth double-checking when you do:

1. The tests insert directly into `auth.users` with a minimal column
   set (`id`, `aud`, `role`, `email`, `encrypted_password`,
   `email_confirmed_at`, `created_at`, `updated_at`). This is the
   commonly-stable subset across GoTrue/Supabase versions, but if your
   local `auth.users` schema has additional `NOT NULL` columns without
   defaults, the insert will need adjusting.
2. The tests impersonate roles via `set local role authenticated;
   set local request.jwt.claim.sub to '<uuid>';`. This assumes
   `auth.uid()` reads `request.jwt.claim.sub`. If your local Supabase
   version's `auth.uid()` only reads the newer `request.jwt.claims`
   JSON GUC, the impersonation won't take effect and the tests that
   depend on `auth.uid()` will fail in a way that looks like an RLS
   bug but isn't.

## Unresolved questions

- **"One approved claim, ever" is permanent, even post-revocation.** See
  the flagged note under `profile_claims` above: once a claim is
  approved for a claimant or a person, no other claim for that same
  claimant/person can become approved again, even after the resulting
  `user_person_links` row is revoked. Needs product-owner confirmation
  that this is acceptable, or a follow-up design for "revoke and
  re-approve a correction."
- **FK behavior on `auth.users` deletion.** `profile_claims.
  claimant_user_id`, `profile_claims.reviewer_admin_id`,
  `user_person_links.user_id`, and `user_person_links.
  linked_by_user_id` all reference `auth.users(id)` with the default
  `NO ACTION` (neither `CASCADE` nor `SET NULL`). This preserves claim
  and link history (matching "Deletion and Retention" in
  `docs/database-schema.md`), but it also means deleting an
  `auth.users` row while these references exist will currently be
  **blocked** by Postgres, not silently handled. `docs/database-schema.
  md` says account deletion should transition the link to `revoked`
  rather than delete anything — but no account-deletion feature exists
  yet to do that. Whoever builds account deletion needs to explicitly
  revoke the link (and decide what happens to `profile_claims` rows)
  *before* the `auth.users` row can be removed. Flagged now so it isn't
  discovered the hard way later.
- **`linked_by_user_id` addition** (see above) — confirm this is wanted
  before other code depends on it.
- **`middle_names` and `merged_into_person_id` omissions** (see above)
  — confirm these should stay deferred.
- **`audit_logs.action` enum is narrow** (`create`, `update`, `delete`,
  `approve`, `reject`) — the full schema's list is longer (`merge`,
  `publish`, etc.). Kept narrow deliberately since nothing in this
  milestone merges or publishes anything yet; will need extending
  alongside whatever feature needs those actions.
- **pgTAP as the testing approach** — no test framework existed in the
  repo before this migration. pgTAP (via `supabase test db`) is
  Supabase's own standard local-testing mechanism, so it was adopted
  rather than introducing a different one, but this is the first time
  it's used here and is itself worth a second look.

## What remains for M3.2

- Design and implement an administrator-role mechanism, then revisit
  every RLS policy here that currently says "service-role only."
- Design `profile_visibility_settings` and decide what (if anything)
  about `people` becomes readable by `anon`/`authenticated` — this
  unblocks giving `people` any GRANT/policy at all.
- Decide whether `middle_names` and `merged_into_person_id` should be
  added to `people`, and if so, under what visibility/workflow rules.
- Build the account-deletion flow referenced in "Unresolved questions"
  above, including how it interacts with `user_person_links` and
  `profile_claims`.
- Everything explicitly out of scope for M3.1 per the brief:
  authentication pages, profile forms, institutions, participation,
  projects, publications, forum, media.
