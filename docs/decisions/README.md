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

## Existing records

None yet. The initial stack and conventions for this project (Next.js App
Router, TypeScript strict mode, Tailwind CSS, ESLint, Supabase/PostgreSQL,
modular-monolith architecture) were established directly in `CLAUDE.md`
and `docs/architecture.md` rather than as a standalone ADR; future changes
to those choices should be recorded here.
