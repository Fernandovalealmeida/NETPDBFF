# Architecture Decision Records

This folder holds short records of significant, hard-to-reverse decisions
made on this project — the kind of decision a future contributor would
otherwise have to reconstruct from git history or guesswork.

## When to add one

Add a decision record for choices such as: adopting or replacing a core
technology, a schema modeling approach with real tradeoffs, or a security/
privacy approach that other work will depend on. Small, easily reversible
choices don't need one.

## Format

Create a new file named `NNNN-short-title.md` (zero-padded, sequential),
using this template:

```markdown
# NNNN. Title

Date: YYYY-MM-DD
Status: Proposed | Accepted | Superseded by NNNN

## Context

What problem or question prompted this decision.

## Decision

What was decided.

## Consequences

What this makes easier or harder going forward.
```

The initial stack and conventions for this project (Next.js App Router,
TypeScript strict mode, Tailwind CSS, ESLint, Supabase/PostgreSQL,
modular-monolith architecture) were established directly in `CLAUDE.md`
and `docs/architecture.md` rather than as a standalone ADR; future changes
to those choices should be recorded here.

## Existing records

- [0001](0001-separate-people-from-user-accounts.md) — Separate people from user accounts
- [0002](0002-theming-and-server-client-theme-handling.md) — Theming and server/client theme handling
- [0003](0003-component-primitives-headless-for-complex-interactions.md) — Headless component primitives for complex interactions
- [0004](0004-icon-library-lucide.md) — Icon library: Lucide
- [0005](0005-no-animation-library-for-m5.md) — No animation library for M5
- [0006](0006-public-static-shell-vs-authenticated-dynamic-shell.md) — Public static shell vs. authenticated dynamic shell
- [0007](0007-netpdbff-first-vertical-general-research-infrastructure.md) — NetPDBFF as the first vertical of a general research-infrastructure platform (Accepted)
- [0008](0008-claim-discovery-security-definer-function.md) — Claim discovery via `SECURITY DEFINER` function
- [0009](0009-reviewer-authorization-table.md) — Reviewer authorization table
- [0010](0010-platform-vision-nodes-of-knowledge.md) — Platform Vision: Nodes of Knowledge
- [0011](0011-scientific-biography-read-model.md) — Scientific Biography read model, narrative-as-assertion, and the M6.1 route boundary
- [0012](0012-timeline-engine.md) — Timeline Engine: canonical event model, temporal model, and the Many-Clocks read boundary
