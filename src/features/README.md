# src/features

Feature modules (e.g. `people`, `participation`, `relationships`,
`nominations`, `institutions`, `projects`, `publications`, `oral-histories`,
`forum`, `search`, `network`, `analytics`, `admin`). Each feature owns its
own components, server actions/queries, and types, kept separate from
generic UI and from other features. See docs/architecture.md for the
planned module boundaries.

- `auth` (M4) — authentication Server Actions and action-state types.
- `identity` (M5.3) — the identity-claiming feature: pure claim-status
  derivation and state-to-copy mapping (`derive-status.ts`, `copy.ts`),
  validation (`validation.ts`), the read-only status lookup used by
  `/member`/`/account` (`status.ts`), and the claim-discovery/submission/
  withdrawal Server Actions (`actions/`). Does not include the person
  record itself or any admin/review functionality — see
  `docs/decisions/0008-claim-discovery-security-definer-function.md` and
  `docs/application-information-architecture.md`'s "Future member
  structure" for what's still deferred (a person-record view, claim
  review, participation/relationships/publications).

No other feature modules exist yet.
