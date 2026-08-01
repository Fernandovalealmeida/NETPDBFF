import type { Metadata } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { FutureAction } from "@/components/ui/FutureAction";
import { PageHeader } from "@/components/ui/PageHeader";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Account — NetPDBFF",
};

function formatDate(value: string | null | undefined): string {
  if (!value) return "Unknown";
  return new Date(value).toLocaleString();
}

// M5.2 redesign — restyled onto tokens/primitives only. Every fact shown,
// the Supabase call that fetches them, and the two real links are
// unchanged from M4/M5.1: still `getUser()` (not `getClaims()`), for the
// same reason as before — `created_at`/`email_confirmed_at` live on the
// full user record, not the JWT claims (see
// docs/authentication-implementation.md's getClaims/getUser/getSession
// guidance). Still shows only minimal Auth-account information — never a
// historical person profile (see
// docs/decisions/0001-separate-people-from-user-accounts.md). No profile
// editing, identity claiming, account deletion, email change, notification
// preferences, or new Server Action were added — none of that is this
// page's job yet.
export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main id="main-content" tabIndex={-1} className="py-16">
      <Container width="content">
        <PageHeader
          title="Account"
          description="Minimal information about your NetPDBFF sign-in account. This is not a person profile."
        />

        {/* Authentication/account information — real, currently-true facts. */}
        <Card className="mt-8">
          <dl className="divide-y divide-border-default text-sm">
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="text-foreground">{user?.email ?? "Unknown"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted-foreground">Email confirmed</dt>
              <dd className="text-foreground">{user?.email_confirmed_at ? "Yes" : "No"}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-muted-foreground">Account created</dt>
              <dd className="text-foreground">{formatDate(user?.created_at)}</dd>
            </div>
          </dl>
        </Card>

        {/* Future person-record/profile functionality — clearly separated
            from the real account facts above, never implied to exist yet. */}
        <EmptyState
          className="mt-6"
          title="Changing your password while signed in isn't available yet"
          description="This will live under Account → Security in a later milestone."
          action={<FutureAction label="Account → Security" />}
        />

        <p className="mt-4 text-sm text-muted-foreground">
          To reset a forgotten password now, use{" "}
          <Link href="/forgot-password" className="font-medium text-foreground underline underline-offset-2">
            Forgot password
          </Link>{" "}
          from the login page.
        </p>
      </Container>
    </main>
  );
}
