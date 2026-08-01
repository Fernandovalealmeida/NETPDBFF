# Controlled Vocabularies

## Status

This document explains how controlled vocabularies will be managed. No
vocabularies are implemented yet — this is a statement of approach ahead
of the database and features that will need it.

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
