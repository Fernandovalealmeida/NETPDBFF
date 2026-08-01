# Application Information Architecture

## Status

Product-design and architectural preparation for **M5 — Application UI /
Design System**. This document defines structure — routes, navigation,
hierarchy, and states — not implementation. Routes and pages marked
"future" or "planned" do not exist in the codebase; see
`docs/development-roadmap.md` for when each is actually scheduled, and
`docs/m5-application-ui-design-system.md` for exactly what M5 itself
builds. Nothing here should be read as already implemented.

## Four audiences, not two

Every screen in NetPDBFF belongs to one of four audiences. This document
uses the same four levels `docs/authentication-implementation.md`
introduced (its "Route-access matrix") and extends them structurally,
rather than redefining them:

1. **Public visitor** — no session. Sees only `Public` information per
   `docs/privacy-model.md`.
2. **Authenticated account** — a real Supabase Auth session exists
   (`auth.users`), fully implemented as of M4. This says nothing about
   *who* the person is — see `docs/decisions/0001-separate-people-from-user-accounts.md`.
3. **Linked NetPDBFF member** *(future)* — an authenticated account with
   an approved `user_person_links` row (`docs/database-schema.md`). Not
   implemented anywhere yet; M5 must not fabricate this state.
4. **Administrator** *(future)* — a role that doesn't exist in the schema
   yet (`docs/database-implementation.md`, "Admin-review limitation").

M5 builds interface for audiences 1 and 2 only. It establishes visual and
structural *placeholders* consistent with audiences 3 and 4 (so later
milestones don't require a redesign) without implementing any gating,
content, or workflow for them — this document is explicit about which
parts of the structure below are placeholder-only.

## Public application structure

| Route | Status | Purpose |
|---|---|---|
| `/` | Built (M1–M4); redesigned visually in M5 | Landing page |
| `/login` | Built (M4); redesigned visually in M5 | Sign in |
| `/register` | Built (M4); redesigned visually in M5 | Create an Auth account |
| `/forgot-password` | Built (M4); redesigned visually in M5 | Request a password reset |
| `/auth/confirm` | Built (M4), Route Handler, no UI | Token exchange |
| `/auth/error` | Built (M4); redesigned visually in M5 | Generic "link didn't work" |
| `/about` | **Not built.** Planned public route, structural placeholder only | Project/PDBFF context, in the platform's own voice — not part of M5's scope to write real content for; M5 may reserve the route in navigation without content |
| `/terms`, `/privacy` | **Not built.** Currently placeholder text inline on `/register` | Real legal documents — out of scope for M5 and every milestone until legal review; navigation should not link to routes that don't exist |

## Authenticated application structure

| Route | Status | Purpose |
|---|---|---|
| `/member` | Built (M4); redesigned visually in M5 | Authenticated home; explicitly explains account-vs-person-record status |
| `/account` | Built (M4); redesigned visually in M5 | Minimal Auth-account info |
| `/update-password` | Built (M4); redesigned visually in M5 | Complete a password reset started by email |
| `/account/security` | **Not built.** Named as "coming soon" by both `/account` and `/update-password` today | Voluntary password/email changes while signed in — explicitly deferred past M5 too; M5 may reserve the navigational slot, not the page |

## Future member structure (placeholder only)

None of the following exist. They are listed so M5's shells, navigation,
and dashboard reserve structurally sensible space for them rather than
requiring a later restructure:

- A person-record view (`people`, per `docs/database-schema.md`) — what
  "Member" eventually becomes once claiming exists.
- A profile-claim flow (`profile_claims`) — the mechanism that turns an
  authenticated account into a linked member.
- Participation history (`pdbff_participations`, `participation_roles`),
  career/education history, institutional affiliations.
- Relationships/network view (`person_relationships`).
- Publications (`person_publications`).

## Future administration structure (placeholder only)

Also entirely unbuilt — no admin role exists in the schema yet:

- A claim-review queue (`profile_claims` awaiting decision).
- A nomination-review queue (`person_nominations`).
- A duplicate-resolution queue (`duplicate_candidates`).
- A verification-review console (`verification_reviews`).
- A moderation console (`moderation_actions`).
- Controlled-vocabulary management (`controlled_vocabulary_requests`).

M5 does not build an `/admin` route, an admin shell variant, or any
role-based UI branching — there is no role to branch on. Where the design
system needs to anticipate a third chrome variant (beyond public and
authenticated), it should note that possibility structurally (see
`AppShell` in `docs/design-system-architecture.md`) without building it.

## Primary navigation

**Public shell** (unauthenticated visitor, current `PublicHeader`
convention retained and formalized): site identity/home, Log in, Register.
`/about` reserved as a future addition once real content exists.

**Authenticated shell** (current `ProtectedNav` convention retained and
formalized): Member, Account, and — once it exists — a future Profile
entry point. The signed-in identity (currently just an email string) and
Log out move into a **user menu** (below) rather than sitting inline as
plain text, now that the design system has a real menu/dropdown
component.

Primary navigation never includes a destination that doesn't resolve to a
real, built page — no dead links to `/about`, future member routes, or
admin routes until each is actually built.

## Secondary navigation

Not needed anywhere in M5's actual scope (both `/member` and `/account`
are single, shallow pages today). The pattern is defined now so it's ready
when `/account` grows a second page (`/account/security`): a simple
horizontal tab strip (the `Tabs` component) under the page header,
scoped to a single section of the app, distinct from primary navigation.
Secondary navigation is never more than one level deep.

## Breadcrumbs

Not needed anywhere in M5's actual route set — every current and
M5-planned page is one or two levels deep, and a page title already
communicates "where am I" at that depth. The `Breadcrumbs` component is
defined in the design system (see `docs/design-system-architecture.md`)
because future deep hierarchies will need it (e.g. an institution →
person → participation-period drill-down), but M5 ships the component
without using it in any route it controls, and should not add breadcrumbs
to `/member`, `/account`, or the auth pages just because the component
exists.

## User menu

**New in M5.** Replaces the current inline "email · Log out" text pattern
in `ProtectedNav` with a proper dismissible menu (trigger: avatar
placeholder or the account's email, per `docs/design-system-architecture.md`'s
`Avatar` component) containing: the signed-in email, links to Member and
Account, and Log out. Collapsing this into a menu is what makes room for
mobile navigation (below) and for the future addition of more account-area
links without the header growing unbounded. Fully keyboard-operable
(arrow-key item navigation, `Escape` to close, focus returned to the
trigger on close) — see accessibility requirements in
`docs/design-system-architecture.md`.

## Mobile navigation

**New in M5.** Below the navigation-collapse breakpoint (see
"Breakpoints" in `docs/design-system-architecture.md`), both the public
and authenticated headers collapse their link set into a single disclosure
trigger opening a `MobileNavigation` panel (a full-height drawer or
slide-down panel — exact treatment is a component-implementation
decision, not an architectural one). The panel surfaces the same links as
desktop primary navigation plus the user-menu contents when authenticated
— nothing available on desktop should be unreachable on mobile. The
trigger is a real, labeled control (`aria-expanded`, `aria-controls`), not
an unlabeled icon-only hamburger with no accessible name.

## Route hierarchy

```
/                              public, built
/login                         public, built
/register                      public, built
/forgot-password               public, built
/auth/confirm                  public, built (route handler, no UI)
/auth/error                    public, built
/about                         public, PLANNED (M5 may reserve nav slot only)

/member                        authenticated, built
/account                       authenticated, built
  /account/security            authenticated, PLANNED (post-M5)
/update-password               authenticated, built

/[person]                      FUTURE — person profile (unclaimed/claimed), not scheduled before a later milestone
/[institution]                 FUTURE — institution page, not scheduled before a later milestone
/admin/*                       FUTURE — no admin role exists yet
```

## Page hierarchy

Every page in M5's scope follows the same structural pattern, formalized
as `PageHeader` + content region (see `docs/design-system-architecture.md`):

1. **Page header** — title, optional short description, optional primary
   action. No breadcrumb at this shallow depth (see above).
2. **Status/banner region** — where `FormMessage`-style banners
   (info/success/error), already established in M4, render — confirmation
   banners, expired-session notices, etc.
3. **Primary content region** — the form, the info list, or (for the
   dashboard) the dashboard cards.
4. **Secondary/contextual links** — e.g. "Don't have an account? Register"
   under the login form, already established in M4.

Detail pages for future domain entities (a person, an institution, a
publication) will need a richer pattern (header + tabs + content), which
is why `Tabs`, `SectionHeader`, and `Breadcrumbs` are defined now even
though M5 doesn't use all of them yet — see "Component-composition
principles" in `docs/design-system-architecture.md`.

## Dashboard hierarchy

M5 introduces a **member dashboard shell** at `/member`, replacing today's
single paragraph of explanatory text with a structured (but still
honest) layout. Per the milestone's explicit requirement, it must not
fabricate data that doesn't exist yet. Structure:

1. **Welcome/status header** — signed-in identity, account status
   (already shown today).
2. **"Your account" summary card** — the same minimal facts `/account`
   shows (email, confirmation status), surfaced here too as a real,
   currently-true summary — not a placeholder.
3. **"Not yet connected" state** — today's explanatory message about
   account-vs-person-record status, restyled using `EmptyState`, not
   invented dashboard widgets standing in for participation history,
   network connections, or publications that don't exist. This is the
   single most important constraint on this page: every future section
   (participation summary, network preview, publication count) is
   represented, if at all, as a clearly labeled "not available yet" empty
   state — never a zero, a skeleton pretending to load real data, or a
   fabricated example.
4. **Quick links** — to Account and (once it exists) Account → Security.

## Empty, loading, error, and permission-denied states

Defined once, here, as states — not as one-off page copy — because every
current and future page needs a consistent version of each:

- **Empty.** Content that could exist but doesn't yet for this
  user/record (e.g. `/member`'s "not yet connected" state, a future
  "no participation history recorded" state). Uses the `EmptyState`
  component: a short, honest explanation and, where relevant, a next
  action. Never styled identically to an error.
- **Loading.** In-flight data fetches or Server Action submissions.
  `SubmitButton`'s pending state (already built in M4) is the pattern for
  form submission; `Skeleton` is the pattern for content that hasn't
  arrived yet on initial render. Never an unlabeled spinner with no
  accessible status text.
- **Error.** Something failed that the user might retry (`FormMessage`
  tone="error", already built) or that needs a dedicated page
  (`/auth/error`, already built). Error copy is specific about what
  happened where the underlying cause is safe to disclose, and generic
  where disclosing it would leak information (see
  `docs/authentication-implementation.md`, "Account-enumeration review" —
  M5's error-state conventions must not regress this).
- **Permission-denied.** Distinct from "error" — the request succeeded in
  the sense that the system understood it, but the visitor isn't allowed
  to see the result (e.g. a future attempt to view a private field, or a
  non-admin visiting an admin route once one exists). M5 doesn't have a
  real permission-denied scenario yet (route protection today is binary:
  redirect to `/login`, not "show a denied page"), but the visual pattern
  is defined now — a calm, specific explanation, never a bare "403" or a
  generic error page — so it's ready when partial-visibility content
  (per `docs/privacy-model.md`) starts rendering.
