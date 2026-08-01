import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account — NetPDBFF",
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString();
}

// Shows only minimal Auth-account information — never a historical person
// profile (see docs/decisions/0001-separate-people-from-user-accounts.md).
// Uses getUser() rather than getClaims() specifically because this page
// needs fields (created_at, email_confirmed_at) that live on the full user
// record, not the JWT claims — see Supabase's getClaims/getUser/getSession
// guidance in docs/authentication-implementation.md.
export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">Account</h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
        Minimal information about your NetPDBFF sign-in account. This is not a person profile.
      </p>

      <dl className="mt-8 divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
        <div className="flex items-center justify-between gap-4 py-3">
          <dt className="text-neutral-500 dark:text-neutral-400">Email</dt>
          <dd className="text-neutral-900 dark:text-neutral-100">{user?.email ?? "Unknown"}</dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-3">
          <dt className="text-neutral-500 dark:text-neutral-400">Email confirmed</dt>
          <dd className="text-neutral-900 dark:text-neutral-100">
            {user?.email_confirmed_at ? "Yes" : "No"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4 py-3">
          <dt className="text-neutral-500 dark:text-neutral-400">Account created</dt>
          <dd className="text-neutral-900 dark:text-neutral-100">
            {formatDate(user?.created_at)}
          </dd>
        </div>
      </dl>

      <div className="mt-8 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
        Changing your password while signed in will be available soon under Account → Security.
        To reset a forgotten password now, use{" "}
        <Link
          href="/forgot-password"
          className="font-medium text-neutral-900 underline underline-offset-2 dark:text-neutral-100"
        >
          Forgot password
        </Link>{" "}
        from the login page.
      </div>
    </main>
  );
}
