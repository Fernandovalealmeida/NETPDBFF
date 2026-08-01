import Link from "next/link";

import { LogoutButton } from "@/components/auth/LogoutButton";

interface ProtectedNavProps {
  email: string;
}

const linkClasses =
  "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100";

// Rendered only from src/app/(protected)/layout.tsx, which has already
// verified the session and fetched the claims this component displays — no
// extra Supabase call happens here. Kept as a separate component (rather
// than folded into PublicHeader) specifically so the public landing page
// and other public routes never need to check auth state to render their
// header — see PublicHeader.tsx.
export function ProtectedNav({ email }: ProtectedNavProps) {
  return (
    <div className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-2 text-sm">
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/member" className={linkClasses}>
            Member
          </Link>
          <Link href="/account" className={linkClasses}>
            Account
          </Link>
          <span className="hidden text-neutral-400 sm:inline" aria-hidden="true">
            ·
          </span>
          <span className="hidden text-neutral-500 sm:inline dark:text-neutral-400">{email}</span>
        </nav>

        <LogoutButton />
      </div>
    </div>
  );
}
