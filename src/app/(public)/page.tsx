import { Alert } from "@/components/ui/Alert";
import { Container } from "@/components/ui/Container";

// M5.2 landing-page redesign (M5 spec item 6): same three pieces of content
// as the M1–M4 version — project name, temporary subtitle, development
// notice — rebuilt on the token system and layout primitives, not expanded.
// Per docs/product-specification.md: "no dashboard, statistics, member
// profiles, or decorative product features — only the project name, a
// temporary subtitle, and a development notice." Per
// docs/ui-vision.md's design philosophy ("quiet... like opening a
// well-organized field station's records"), this stays minimal rather than
// gaining hero-section visual flourish just because a richer component set
// now exists.
//
// Title + subtitle are hand-built here rather than via the `PageHeader`
// component: PageHeader's layout (left-aligned title/description with an
// optional right-aligned action, `justify-between`) is shaped for
// interior/dashboard pages per docs/application-information-architecture.md's
// "Page hierarchy", not a centered marketing-style hero — and `cn()` is
// deliberately not `tailwind-merge` (see src/lib/ui/cn.ts), so overriding
// PageHeader's alignment classes via `className` wouldn't reliably win in
// the generated stylesheet. Using the token system directly here is more
// honest than forcing a component whose shape doesn't fit.
//
// Statically rendered (no `cookies()`/Supabase call, directly or
// transitively) — required by item 6's acceptance criteria and already
// guaranteed by `src/app/(public)/layout.tsx` staying static per ADR-0006.
export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <Container width="content" padded={false} className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          NetPDBFF
        </h1>

        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          The living human network of the Biological Dynamics of Forest Fragments Project
        </p>

        <Alert tone="neutral" className="mt-10 text-left">
          This platform is under development. Content and functionality will be introduced
          progressively.
        </Alert>
      </Container>
    </main>
  );
}
