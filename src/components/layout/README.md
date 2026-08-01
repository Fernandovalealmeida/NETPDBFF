# src/components/layout

Structural, page-shell components shared across routes (e.g. header, footer,
navigation, page containers). These are presentational; they should not
contain data-fetching or business logic (see CLAUDE.md).

`PublicHeader.tsx` and `ProtectedNav.tsx` exist here today (M4) — see their
own file comments. **M5.1 (Design Foundations) did not modify either one**
and did not build `AppShell`, `ProtectedHeader` (the M5-formalized
generalization of `ProtectedNav`, adding the user menu), or
`MobileNavigation`. M5.1's scope was the token system, theming mechanism,
and the primitive component library in `src/components/ui` only — see that
folder's README. Building the shells, wiring `MobileNavigation` and the
user menu, and redesigning `/`, `/login`, `/register`, `/forgot-password`,
`/member`, and `/account` around the new primitives is M5.2 scope, per
`docs/m5-application-ui-design-system.md` items 3–9.
