# Development Roadmap

## Status

Phased plan at a conceptual level. Phases are sequential in intent but
scope and order may shift as design work in each area proceeds. Nothing
beyond Phase 0 is implemented yet.

## Phase 0 — Project foundation (this work)

Next.js + TypeScript + Tailwind + ESLint setup, initial source structure,
documentation set, and a minimal landing page. No authentication,
database, or product features.

## Phase 1 — Authentication and core people data

Supabase integration, authenticated user accounts, PostgreSQL migrations
introducing the initial person model (distinct from accounts), and basic
Row Level Security policies.

## Phase 2 — Profiles, participation history, and institutions

Person profiles (claimed and unclaimed), PDBFF participation periods,
career history, and institution records.

## Phase 3 — Nominations and relationships

Person nominations (adding people who haven't registered), person-to-
person relationships with inferred vs. confirmed status, and the
verification workflows that connect to `docs/privacy-model.md`.

## Phase 4 — Projects, publications, and oral histories

Research project records, publication records linked to people/projects,
and oral history documentation.

## Phase 5 — Forum

Member discussion space, scoped to registered/verified members per
`docs/user-roles.md`.

## Phase 6 — Search and network visualization

Cross-entity search and interactive visualization of the person/
institution/project network.

## Phase 7 — Analytics and administration

Aggregate, non-personal analytics, and administrative tooling for
moderation, verification, and auditable data management.

## Phase 8 — Portuguese internationalization

Introduction of a translation layer and Portuguese as a second interface
language, building on the i18n-readiness described in
`docs/architecture.md`.

## Ongoing, throughout every phase

- Tests accompanying each new feature (per `CLAUDE.md`).
- Accessibility and responsiveness review.
- Architecture decision records for significant choices (`docs/decisions/`).
