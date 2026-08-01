import type { Metadata } from "next";
import Link from "next/link";

import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register — NetPDBFF",
};

// Registration creates only a Supabase Auth account — see
// docs/decisions/0001-separate-people-from-user-accounts.md and
// src/features/auth/actions/register.ts. It never creates a `people` row,
// a profile claim, or a user-person link.
export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Create an account
      </h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        This creates a NetPDBFF account you can sign in with. Connecting the account to a specific
        person in PDBFF&apos;s history is a separate step, available after you confirm your email.
      </p>

      <div className="mt-8">
        <RegisterForm />
      </div>

      <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-neutral-900 underline underline-offset-2 dark:text-neutral-100"
        >
          Log in
        </Link>
      </p>
    </main>
  );
}
