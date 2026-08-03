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

## Milestone status — M6.1 (Scientific Biography Foundation)

**Implemented (pending local validation).** M6 begins turning the M1–M5
application foundation into institutional memory. M6.1 delivers the first
production, database-backed vertical slice of the Digital Scientific
Biography: the `person_narrative` assertion, the `get_person_biography`
canonical read model, and the authenticated `/people/[personId]` read
experience (identity, introductory narrative or honest absence, provenance
surface, reserved section architecture), with pgTAP/Vitest/Playwright
coverage. See `docs/m6.1-scientific-biography-foundation.md` and
`docs/decisions/0011-scientific-biography-read-model.md`. The Timeline,
Participation, Relationship, Institution, Historical Records, and Legacy
engines are deferred to later M6 milestones and reserved as extension points.

## Milestone status — M6.2 (Timeline Engine: the Historical Spine)

**Implemented (pending local validation).** M6.2 delivers the second
production engine of the Digital Scientific Biography: the historical spine.
It adds the subject-neutral event model (`events`), the event-kinds
vocabulary table (`event_kinds`), the person↔event projection edge
(`person_events`), and the `get_person_timeline` canonical read model, then
renders a calm, provenance-aware, honestly-uncertain chronology inside the
`/people/[personId]` biography — replacing the M6.1 reserved Timeline
placeholder with the real engine. The nine-state temporal model keeps
precision, approximation, uncertainty, intervals, open-endedness, and unknown
dates distinct; decade period navigation appears only when the record spans
two or more decades. pgTAP/Vitest/Playwright coverage accompanies it. See
`docs/m6.2-timeline-engine.md` and
`docs/decisions/0012-timeline-engine.md`. The event core is architected so the
same model later serves institution/project/station/expedition/collection/
record/species clocks unchanged; the Participation, Relationship, Institution,
and Legacy engines remain deferred and reserved as extension points.
