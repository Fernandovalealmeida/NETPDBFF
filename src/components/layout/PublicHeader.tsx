import Link from "next/link";

// Fully static — no cookies()/Supabase call of any kind. This is what keeps
// routes using the root layout (including the public landing page) from
// being forced into dynamic rendering just to render a header. See
// docs/authentication-implementation.md, "Cache behavior for authenticated
// pages" — this replaced an earlier version that read the session on every
// request specifically because of that cost.
//
// The Log in/Register links are shown unconditionally, even to an already
// authenticated visitor — that's safe, not stale: src/proxy.ts redirects an
// authenticated visitor away from /login and /register the instant they're
// clicked, straight to /member. Authenticated-only navigation (Member,
// Account, the signed-in email, Log out) lives separately in
// src/components/layout/ProtectedNav.tsx, rendered only inside
// src/app/(protected)/layout.tsx, which is already dynamic by necessity.
export function PublicHeader() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-6 py-4">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100"
        >
          NetPDBFF
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/login"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-neutral-900 px-3 py-1.5 text-white transition hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
