# Canonical User Journey

This document defines the canonical reading experience of Nodes of Knowledge
— the path a first-time reader takes from the landing page through the
People, Institutions, and Contributions of the record of science. It is the
reference experience the product is built around, and it should guide every
future milestone: new work earns its place by extending or deepening this
journey, not by sitting beside it.

Two things make this the *canonical* journey. First, it is expressed entirely
through the production application, using the completed engines and their
real read models — no developer knowledge, no UUIDs, no hidden URLs.
Second, it is honest: it shows provenance, verification, absence, and
disagreement as first-class parts of reading, never hiding them behind a
polished surface.

## The journey

1. **Landing (`/`).** The public entrance. It names what is inside — a
   reading record of scientific lives, the institutions they worked through,
   and the contributions they made — and invites the visitor in. Reading is
   authenticated (the deny-by-default security model is unchanged), so the
   entrance is honest that a free account is needed and offers to register or
   sign in. It stays quiet: no dashboard, statistics, or decorative product
   features.

2. **Explore (`/explore`).** After signing in, the reader arrives at the
   reading hub — the "lobby". Three doorways lead into the completed engines:
   People, Institutions, and Contributions. Explore is pure navigation; the
   directories do the reading.

3. **Directories (`/people`, `/institutions`, `/contributions`).** Each lists
   records **by name**, most-legible first, with honest verification badges
   and — when a directory has nothing yet — an honest empty state. Records are
   reached by their human-readable name; a UUID never appears as visible text.
   These directories are backed by the bounded `list_people` /
   `list_organizations` / `list_contributions` read models and are the only
   place general browsing lives.

4. **A scientific life (`/people/[id]`).** Opening a person reveals the
   Scientific Biography and the reader's main path outward: the Biography
   (with its provenance and verification, or an honest absence where no
   narrative exists), the Timeline (exact through unknown dates, shown
   truthfully), Participation in institutions, and Relationships to other
   people (directional and symmetric, verified through disputed).

5. **An institution through time (`/institutions/[id]`).** Opening an
   institution reveals its identity and name history, its founding period,
   external identifiers, narrative facets, its timeline, and the people who
   participated in it — including historical and closed institutions, shown
   with honest reserved states where later facets are not yet recorded.

6. **A contribution (`/contributions/[id]`).** Opening a contribution reveals
   it as a first-class historical object: the people and institutions
   credited with it, each in their own capacity, with no rankings,
   percentages, or inferred credit.

7. **Following curiosity.** From any of these, the reader follows the
   connections — a person to their institution, an institution to a
   participant, a contribution to everyone credited — and the same canonical
   records reappear from new angles without ever being duplicated. Navigation
   rewards curiosity; historical exploration feels natural.

Throughout, the application's chrome (the authenticated navigation) keeps
Explore, People, Institutions, and Contributions one click away on every
page, so the reader is never stranded.

## Governing rules

These rules follow from making the production application the canonical
product:

- **Production is the canonical product.** The reading experience above is
  the primary way to experience Nodes of Knowledge. Functionality that
  belongs in the normal user experience must exist **only** in production.

- **Production first, for every future engine.** Every future engine (M7
  onward) must first integrate into the production application — its reading
  surfaces and its place in this journey and the navigation — **before** it
  receives any representation in the developer inspection environment. A
  capability never debuts in the exhibition.

- **The exhibition inspects; it never duplicates.** `/dev/exhibition` is a
  deterministic developer inspection environment (see
  `docs/m6-system-exhibition.md`). It exists only to inspect deterministic
  examples, edge cases, reviewer demonstrations, architectural concepts, and
  fictional showcase data. It must never re-create a production browse or any
  other production capability.

- **Truthful representation.** The application should represent its current
  capabilities honestly: where a capability exists, expose it; where it does
  not, show an honest planned/empty state rather than a fabricated one.

## M7 addition — into the Knowledge Network

Landing → Register/Sign in → Explore → People/Institutions/Contributions → canonical entity page → Connections (the network entry link) → Knowledge Network neighbourhood → connected canonical record → continue reading.
