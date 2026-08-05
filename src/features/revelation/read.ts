// Server-only reads of the bounded Revelation read models. Plain async functions,
// called directly from the canonical page Server Components -- the same pattern as
// src/features/network/read.ts and the M6 engine reads. Each wraps ONE SECURITY
// DEFINER function (the authorization + read-only composition + fail-closed
// boundary) and fails closed to null on any error, missing, or unrecognizable
// result. No client-side composition, no whole-graph query -- the deterministic
// composition happens at the server, in the read model, per canonical record.

import { createClient } from "@/lib/supabase/server";

import { parsePersonCohortsDocument } from "./parse";
import { parseOrganizationGenerationsDocument } from "./parse-organization";
import type { OrganizationGenerationsDocument, PersonCohortsDocument } from "./types";

/** M8.1 -- person co-presence: the documented cohorts a person belonged to. */
export async function getPersonCohorts(personId: string): Promise<PersonCohortsDocument | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reveal_person_cohorts", { p_person_id: personId });

  if (error || data === null || data === undefined) {
    return null;
  }

  return parsePersonCohortsDocument(data);
}

/** M8.2 -- institution co-presence: the documented co-presence within one
 * institution (which participants the record places there at the same time). */
export async function getOrganizationGenerations(
  organizationId: string,
): Promise<OrganizationGenerationsDocument | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reveal_organization_generations", {
    p_organization_id: organizationId,
  });

  if (error || data === null || data === undefined) {
    return null;
  }

  return parseOrganizationGenerationsDocument(data);
}
