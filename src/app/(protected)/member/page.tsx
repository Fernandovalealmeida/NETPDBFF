import type { Metadata } from "next";
import Link from "next/link";

import { Card } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { FormMessage } from "@/components/ui/FormMessage";
import { FutureAction } from "@/components/ui/FutureAction";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Member area — NetPDBFF",
};

interface MemberPageProps {
  searchParams: Promise<{ confirmed?: string }>;
}

// M5.2 redesign. Structure follows
// docs/application-information-architecture.md's "Dashboard hierarchy"
// exactly: (1) welcome/status header, (2) a real "Your account" summary
// card, (3) the "not yet connected" empty state, (4) quick links — no step
// added or reordered beyond restyling onto tokens/primitives.
//
// This page must never query or expose `people` records — identity
// claiming is a later milestone (see
// docs/decisions/0001-separate-people-from-user-accounts.md). It only
// displays the authenticated account's own email, unchanged from M4/M5.1 —
// no new Supabase call was added for this redesign.
//
// Single-column `Container` deliberately: nothing on this page has enough
// content to justify a second column yet. `Section`/`Stack`/`Grid`
// (src/components/ui) already exist for a future two-column workspace
// layout — composing this page into one later is a page-level change, not
// a new primitive.
export default async function MemberPage({ searchParams }: MemberPageProps) {
  const params = await searchParams;
  const justConfirmed = params.confirmed === "1";

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = typeof data?.claims?.email === "string" ? data.claims.email : "your account";

  return (
    <main id="main-content" tabIndex={-1} className="py-16">
      <Container width="content">
        {/* 1. Welcome/status header */}
        <PageHeader title="Member area" />

        {/* Explicit "confirmation success" state — only shown once, right
            after following the signup-confirmation link. */}
        {justConfirmed ? (
          <div className="mt-4">
            <FormMessage tone="success">Your email address has been confirmed.</FormMessage>
          </div>
        ) : null}

        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;re signed in as <strong className="font-medium text-foreground">{email}</strong>.
        </p>

        <Section spacing="sm" className="mt-8 flex flex-col gap-6">
          {/* 2. "Your account" summary card — the same minimal facts
              /account shows, surfaced here too as a real, currently-true
              summary, not a placeholder. */}
          <Card>
            <h2 className="text-sm font-medium text-foreground">Your account</h2>
            <dl className="mt-3 divide-y divide-border-default text-sm">
              <div className="flex items-center justify-between gap-4 py-2">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="text-foreground">{email}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="text-foreground">Authenticated</dd>
              </div>
            </dl>
          </Card>

          {/* 3. "Not yet connected" state — restyled, not reworded in
              substance. Every future section (participation, network,
              publications) is represented only as this one honest empty
              state — never a zero, a skeleton, or a fabricated example. */}
          <EmptyState
            title="Not yet connected to a NetPDBFF person record"
            description="Claiming a historical or existing person record — and everything about PDBFF participants, participation history, and the network — will be available in a later milestone."
            action={<FutureAction label="Claim a person record" />}
          />

          {/* 4. Quick links */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/account" className="font-medium text-foreground underline underline-offset-2">
              Account
            </Link>
            <FutureAction label="Account → Security" />
          </div>
        </Section>
      </Container>
    </main>
  );
}
