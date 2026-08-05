// Pure presentation derivation for the Revelation Engine (M8.1 co-presence).
// No I/O, no JSX, no composition, no ranking. The read model has already done
// the deterministic composition and neutral ordering (organization name, then
// member display_name); this only decides whether anything was revealed. A
// cohort's and a member's position is fixed reading order, never importance.

import type { PersonCohortsDocument, Cohort } from "./types";

export interface PersonCohortsView {
  isEmpty: boolean;
  cohorts: Cohort[];
}

/** A null document (read failed / absent) and an empty cohorts array both read
 * as the same honest absence -- never an error, never a fabricated cohort. */
export function buildPersonCohortsView(document: PersonCohortsDocument | null): PersonCohortsView {
  if (document === null || document.cohorts.length === 0) {
    return { isEmpty: true, cohorts: [] };
  }
  return { isEmpty: false, cohorts: document.cohorts };
}

// Provenance labelling is the platform-shared kernel, re-exported so a revealed
// cohort member reads provenance identically to every other engine.
export { describeProvenance as describeRevelationProvenance } from "@/features/shared/provenance";
export type { ProvenanceDescriptor as RevelationProvenanceDescriptor } from "@/features/shared/provenance";
