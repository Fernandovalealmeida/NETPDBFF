# NetPDBFF

NetPDBFF will document and connect all people who have participated in the
Biological Dynamics of Forest Fragments Project (PDBFF) across its
history — researchers, field assistants, students, staff, and
collaborators, past and present.

This repository currently contains only the **project foundation**:
tooling, structure, and documentation. No authentication, profiles,
database, or search functionality is implemented yet. See
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
- `docs/product-specification.md` — product scope and goals
- `docs/architecture.md` — modular-monolith architecture and planned modules
- `docs/database-model.md` — preliminary conceptual data model
- `docs/privacy-model.md` — visibility levels for personal information
- `docs/user-roles.md` — preliminary user roles
- `docs/controlled-vocabularies.md` — how domain vocabularies are managed
- `docs/development-roadmap.md` — phased build plan
- `docs/decisions/` — architecture decision records (ADRs)
- `docs/supabase-development.md` — local/hosted Supabase development setup

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values as they become
relevant. Never commit `.env.local` or any file containing real secrets.

## Internationalization

The interface language at launch is English. The codebase is structured to
support Portuguese as a future addition without requiring a rewrite — see
`docs/architecture.md`.
