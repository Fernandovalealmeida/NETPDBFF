import type { Metadata } from "next";

import { FormMessage } from "@/components/ui/FormMessage";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Member area — NetPDBFF",
};

interface MemberPageProps {
  searchParams: Promise<{ confirmed?: string }>;
}

// This page must never query or expose `people` records — identity claiming
// is a later milestone (see docs/decisions/0001-separate-people-from-user-accounts.md).
// It only displays the authenticated account's own email.
export default async function MemberPage({ searchParams }: MemberPageProps) {
  const params = await searchParams;
  const justConfirmed = params.confirmed === "1";

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : "your account";

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        Member area
      </h1>

      {/* Explicit "confirmation success" state — only shown once, right
          after following the signup-confirmation link. */}
      {justConfirmed ? (
        <div className="mt-4">
          <FormMessage tone="success">Your email address has been confirmed.</FormMessage>
        </div>
      ) : null}

      <p className="mt-4 text-sm text-neutral-700 dark:text-neutral-300">
        You&apos;re signed in as <strong>{email}</strong>.
      </p>

      <div className="mt-6 rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
        Your account is authenticated, but it isn&apos;t yet connected to a NetPDBFF person
        record. Claiming a historical or existing person record — and everything about PDBFF
        participants, participation history, and the network — will be available in a later
        milestone.
      </div>
    </main>
  );
}
