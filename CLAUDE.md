# CLAUDE.md

This file defines permanent working rules for anyone — human or AI agent —
making changes to NetPDBFF. It is not a design document; see `docs/` for
product, architecture, data model, and privacy details. When these rules
and a specific instruction conflict, ask before proceeding.

## Stack

- Use Next.js, TypeScript, PostgreSQL, Supabase, and Tailwind CSS.
- Use PostgreSQL migrations for every future schema change. Never modify
  the database schema by hand outside of a migration.
- Use Server Components by default. Only use Client Components where
  interactivity genuinely requires them (state, event handlers, browser
  APIs), and keep the client boundary as small as possible.

## Security and privacy

- Never disable Row Level Security in production.
- Never expose secret or service-role keys to browser code. Anything
  reachable from a Client Component or sent over the network to the
  browser must be treated as public.
- Personal information must support explicit visibility controls (see
  `docs/privacy-model.md`). Do not introduce a field that stores personal
  data without deciding its visibility level.
- Administrative data changes must eventually be auditable. Don't design
  admin write paths in a way that would make later audit logging
  impractical to add.

## Domain modeling

- Keep person records separate from authenticated user accounts. A person
  can exist in the system without ever registering for an account.
- A person may have multiple PDBFF participation periods. Never model
  participation as a single date range or a single role.
- Never treat an inferred relationship as a confirmed relationship.
  Inference and confirmation are different states and must remain
  distinguishable in the data and in the UI.
- Do not hard-code controlled vocabularies (roles, institution types,
  relationship types, etc.) inside interface components. They belong in
  the database/config layer — see `docs/controlled-vocabularies.md`.

## Code organization

- Keep business logic outside presentation components. Components in
  `src/components` render; logic belongs in `src/lib`, `src/features`, or
  server-side code.
- Do not add dependencies without explaining their purpose (in the PR/commit
  description and, where relevant, in this documentation).
- Do not make unrelated changes when completing a task. Keep diffs scoped
  to what was asked.
- New features must include appropriate tests.

## Scope discipline

This project is being built incrementally. Unless a task explicitly asks
for it, do not implement authentication, profiles, database tables,
Supabase wiring, search, or other product features ahead of schedule —
check `docs/development-roadmap.md` for the intended sequence.
