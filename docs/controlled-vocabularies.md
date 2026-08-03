# Controlled Vocabularies

## Status

This document explains how controlled vocabularies are managed. The first
database-backed vocabulary table — `public.event_kinds` (M6.2 Timeline Engine)
— now realizes the approach described here; the rest of this document remains
the statement of approach for the vocabularies still ahead.

## What a controlled vocabulary is, here

A controlled vocabulary is a constrained, curated list of values used
consistently across the platform instead of free text — for example (not
final, illustrative only):

- Participation roles (e.g. researcher, field assistant, student, staff)
- Institution types (e.g. university, government agency, NGO)
- Relationship types (e.g. collaborator, mentor, co-author)
- Nomination/verification statuses (e.g. provisional, verified)
- Visibility levels (see `docs/privacy-model.md`)

## Rule: vocabularies are data, not code

Per `CLAUDE.md`, controlled vocabularies must not be hard-coded inside
interface components (e.g. as inline arrays of strings in a `<select>`).
They are expected to be stored and managed as data — ultimately as
database-backed reference tables, accessed through shared code in
`src/lib` — so that:

- Adding or retiring a value doesn't require a code change and deploy.
- The same vocabulary is enforced consistently across every feature that
  uses it, instead of drifting between components.
- Values can carry metadata (e.g. a Portuguese translation, a
  description, an active/retired flag) without touching UI code.

## Relationship to internationalization

Because vocabularies will need Portuguese translations eventually
(`docs/architecture.md`), storing them as data rather than embedding them
in components also keeps translation a data-layer concern rather than a
component-rewrite concern.

## What's deferred

The actual set of vocabularies, their storage schema, and an
administration interface for managing them are future work, sequenced in
`docs/development-roadmap.md`.

## First realization: `event_kinds` (M6.2)

The Timeline Engine's `public.event_kinds` table (see
`docs/database-implementation.md` and `docs/decisions/0012-timeline-engine.md`)
is the first controlled vocabulary implemented as data rather than code: a
lookup table (`key`, `label`, `description`, `sort_order`, `is_active`) that
`events.event_kind` references by foreign key, seeded with generic,
Node-neutral kinds. Kinds can be added, retired, or eventually translated
without a code change, and no PDBFF-specific category is embedded in interface
components — exactly the discipline this document describes. It is the template
for the participation-role, institution-type, and relationship-type
vocabularies still to come.

## Second realization: `participation_capacities` (M6.3)

The Participation Engine's `public.participation_capacities` table (see
`docs/database-implementation.md` and
`docs/decisions/0013-participation-engine.md`) is the second controlled
vocabulary implemented as data: a lookup table referenced by
`participations.capacity`, seeded with generic, Node-neutral capacities. It is
exactly the participation-role vocabulary anticipated above — and it is where a
Node adds its own capacities (for example a PDBFF *mateiro*) as data, with no
code change and no PDBFF-specific value hardcoded in generic code.
