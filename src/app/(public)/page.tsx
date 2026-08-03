import Link from "next/link";

import { Alert } from "@/components/ui/Alert";
import { buttonVariants } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SITE_DESCRIPTION, SITE_NAME } from "@/config/site";

// Public landing — the entrance to the reading experience. Evolving the
// original M5.2 minimal landing (project name + subtitle + development
// notice) per the current product direction: the application's primary
// activity is *reading* the record of science, so the entrance now names
// what is inside (people, institutions, contributions) and invites the
// visitor in, while staying quiet — no dashboard, statistics, metrics, or
// decorative flourish, consistent with docs/ui-vision.md ("quiet... like
// opening a well-organized field station's records"). Reading itself is
// authenticated (the deny-by-default security model is unchanged), so the
// entrance is honest that a free account is needed.
//
// Statically rendered (no cookies()/Supabase call) — the two calls to
// action are plain links to the existing /register and /login routes.
export default function HomePage() {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="flex flex-1 flex-col items-center justify-center px-6 py-24"
    >
      <Container width="content" padded={false} className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {SITE_NAME}
        </h1>

        <p className="mt-4 text-base text-muted-foreground sm:text-lg">{SITE_DESCRIPTION}</p>

        <p className="mx-auto mt-6 max-w-prose text-base text-foreground">
          A reading record of scientific lives, the institutions they worked through, and the
          contributions they made — each with its history, its sources, and its honest gaps.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register" className={buttonVariants({ emphasis: "primary", size: "md" })}>
            Create an account to read
          </Link>
          <Link href="/login" className={buttonVariants({ emphasis: "secondary", size: "md" })}>
            Sign in
          </Link>
        </div>

        <Alert tone="neutral" className="mt-10 text-left">
          This platform is under development. Reading requires a free account, and the record
          grows as verified people, institutions, and contributions are added.
        </Alert>
      </Container>
    </main>
  );
}
