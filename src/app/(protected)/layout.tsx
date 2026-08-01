import { redirect } from "next/navigation";

import { ProtectedNav } from "@/components/layout/ProtectedNav";
import { createClient } from "@/lib/supabase/server";

// Wraps /member, /account, /update-password (this is a route group — the
// parentheses don't add a URL segment). src/proxy.ts already redirects
// unauthenticated requests to these paths before they reach the app, but
// this layout independently re-verifies the session here too, per "session
// verification on protected server-rendered pages" — proxy decisions are
// not the sole authorization check, since middleware/proxy state can be
// bypassed or misconfigured in ways a server-rendered page's own check
// cannot be.
//
// `getClaims()` verifies the JWT signature rather than trusting whatever is
// in the session cookie — see src/lib/supabase/proxy.ts for the same
// principle applied in the proxy. The claims fetched here are also handed
// to ProtectedNav, so displaying the signed-in email in the nav doesn't
// cost a second Supabase call.
export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/login");
  }

  const email = typeof data.claims.email === "string" ? data.claims.email : "your account";

  return (
    <>
      <ProtectedNav email={email} />
      {children}
    </>
  );
}
