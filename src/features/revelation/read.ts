// Server-only read of the bounded Revelation read model. Plain async function,
// called directly from the biography Server Component -- the same pattern as
// src/features/network/read.ts and the M6 engine reads. Wraps ONE SECURITY
// DEFINER function (the authorization + read-only composition + fail-closed
// boundary) and fails closed to null on any error, missing, or unrecognizable
// result. No client-side composition, no whole-graph query -- the deterministic
// composition happens at the server, in the read model, per canonical record.

import { createClient } from "@/lib/supabase/server";

import { parsePersonCohortsDocument } from "./parse";
import type { PersonCohortsDocument } from "./types";

export async function getPersonCohorts(personId: string): Promise<PersonCohortsDocument | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reveal_person_cohorts", { p_person_id: personId });

  if (error || data === null || data === undefined) {
    return null;
  }

  return parsePersonCohortsDocument(data);
}
