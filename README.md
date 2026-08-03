# NetPDBFF

NetPDBFF will document and connect all people who have participated in the
Biological Dynamics of Forest Fragments Project (PDBFF) across its
history — researchers, field assistants, students, staff, and
collaborators, past and present.

This repository currently contains the project foundation (tooling,
structure, documentation), the M3.1 identity-foundation database schema, and
an M4 email/password authentication vertical slice (see
`docs/authentication-implementation.md`). Profiles, person claiming,
institutions, and search are not implemented yet. See
`docs/development-roadmap.md` for what comes next.

## Stack

- [Next.js](https://nextjs.org/) (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- ESLint
- PostgreSQL via [Supabase](https://supabase.com/) (planned, not yet wired up)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Scripts

| Script              | Purpose                              |
| -------------------- | ------------------------------------ |
| `npm run dev`         | Start the development server         |
| `npm run build`       | Create a production build            |
| `npm run start`       | Run the production build             |
| `npm run lint`        | Run ESLint                           |
| `npm run typecheck`   | Run the TypeScript compiler (no emit) |
| `npm run test`         | Run unit tests (Vitest)              |
| `npm run test:e2e`     | Run end-to-end tests (Playwright; requires local Supabase — see below) |

## Project structure

```
src/
  app/          Next.js App Router routes, layouts, and global styles
  components/
    layout/     Structural, page-shell components
    ui/         Generic, reusable UI primitives
  features/     Feature modules (added as features are built)
  lib/          Shared utilities and integration code
  types/        Shared TypeScript types
  config/       Application-level configuration
docs/           Product, architecture, and data-model documentation
```

## Documentation

- `CLAUDE.md` — permanent project rules
- `docs/master-vision.md` — the platform vision (Nodes of Knowledge) and how
  NetPDBFF is its first Node (Node PDBFF); see also
  `docs/decisions/0010-platform-vision-nodes-of-knowledge.md`
- `docs/nodes-of-knowledge-design-bible-volume-1.md` — The Nodes of Knowledge
  Design Bible, Volume I (Scientific Identities & Institutional Memory): the
  product-philosophy foundation the vision rests on — why the platform exists,
  what a Scientific Biography is, and the design principles that guide every
  milestone (product philosophy, not implementation spec)
- `docs/nodes-of-knowledge-product-blueprint.md` — The Nodes of Knowledge
  Product Blueprint (First Constitutional Edition): the bridge from the Design
  Bible to the built platform — the product primitives, the conceptual engines
  (Scientific Biography, Timeline, Participation, Relationships, Institution),
  and the capability roadmap from which M6 implementation milestones emerge
  (Product Architecture, not implementation spec)
- `docs/nodes-of-knowledge-constitutional-validation-m6v.md` — The Nodes of
  Knowledge Constitutional Validation (M6.V): validates the Design Bible and
  Product Blueprint end-to-end against one real scientific life (G. Bruce
  Williamson at PDBFF); records the verdict that M6.1 may begin, and the
  provenance, participation, and knowledge-history findings behind it
- `docs/m6.1-scientific-biography-foundation.md` — M6.1 Scientific Biography
  Foundation: what the first production biography slice implements, defers, and
  reserves as extension points, plus the required local validation sequence
- `docs/m6.2-timeline-engine.md` — M6.2 Timeline Engine (the Historical
  Spine): the canonical event model, the nine-state temporal model, the
  `get_person_timeline` per-subject read boundary, what it defers, and the
  required local validation sequence
- `docs/m6.3-participation-engine.md` — M6.3 Participation Engine (bounded
  belonging): the `participations` assertion, the minimal `organizations`
  entity, the `participation_capacities` vocabulary, the shared temporal/
  provenance kernel, the `get_person_participation` read boundary, what it
  defers, and the required local validation sequence
- `docs/m6.4-relationship-engine.md` — M6.4 Relationship Engine (relationships
  as historical narratives): the one-canonical-record `relationships` model, the
  `relationship_kinds` vocabulary with directionality and inverse labels, the
  `get_person_relationships` both-side read boundary, ethics/governance notes,
  what it defers, and the required local validation sequence
- `docs/m6.5-institution-engine.md` — M6.5 Institution Engine (institutions as
  historical actors): the additive `organizations` extension, historical names,
  external identifiers, narrative facets, the `organization_events` Event
  projection, the three bounded `get_organization*` reads, the
  `/institutions/[organizationId]` page, sovereignty/ethics notes, what it
  defers, and the required local validation sequence
- `docs/m6.6-contribution-engine.md` — M6.6 Contribution Engine (contribution as a first-class historical object; ADR-0016; engineering report in `docs/m6.6-contribution-engine-engineering-report.md`)
- `docs/product-specification.md` — product scope and goals
- `docs/architecture.md` — modular-monolith architecture and planned modules
- `docs/database-model.md` — preliminary conceptual data model
- `docs/privacy-model.md` — visibility levels for personal information
- `docs/user-roles.md` — preliminary user roles
- `docs/controlled-vocabularies.md` — how domain vocabularies are managed
- `docs/development-roadmap.md` — phased build plan
- `docs/decisions/` — architecture decision records (ADRs)
- `docs/supabase-development.md` — local/hosted Supabase development setup
- `docs/database-implementation.md` — M3.1 identity-foundation schema
- `docs/authentication-implementation.md` — M4 email/password authentication
  (route map, Supabase clients, local Mailpit testing, security decisions)

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values as they become
relevant. Never commit `.env.local` or any file containing real secrets.

## Internationalization

The interface language at launch is English. The codebase is structured to
support Portuguese as a future addition without requiring a rewrite — see
`docs/architecture.md`.
