-- Local development / e2e-test seed data. Runs only via `supabase db
-- reset` / `supabase start` against a local Supabase instance — see
-- supabase/config.toml's `[db.seed]` section (`enabled = true`,
-- `sql_paths = ["./seed.sql"]`, already configured before this file
-- existed). Never applied to a real deployed environment, and never
-- inserts real PDBFF participant data.
--
-- These two `people` rows are the same obviously-fictional-for-this-purpose
-- names already used as pgTAP fixtures
-- (supabase/tests/database/identity_foundation.test.sql,
-- supabase/tests/database/claim_discovery.test.sql) — kept consistent on
-- purpose so it's unambiguous these are test fixtures, not real historical
-- records, and so a reviewer checking test output already recognizes them.
--
-- Purpose: the claim-discovery search/browse flow
-- (tests/e2e/claim-workflow.spec.ts) needs at least one real, eligible
-- `people` row to find. There is no client-reachable, app-level way to
-- create a `people` row at all in this milestone (see
-- docs/decisions/0001-separate-people-from-user-accounts.md and
-- docs/database-implementation.md's "Admin-review limitation") — seeding
-- is the only realistic way to exercise the search/select/submit path
-- end-to-end in a real browser without a database script running outside
-- the app.

insert into public.people (given_name, family_name, display_name, verification_status, source_type)
values
  ('Ada', 'Lovelace', 'Ada Lovelace', 'provisional', 'imported_historical'),
  ('Grace', 'Hopper', 'Grace Hopper', 'provisional', 'imported_historical');
