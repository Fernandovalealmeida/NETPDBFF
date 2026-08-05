// Pure presentation derivation for the Revelation Engine. No I/O, no JSX, no
// composition, no ranking. The read models have already done the deterministic
// composition and neutral ordering (M8.1: organization name then member
// display_name; M8.2: participant display_name then co-present display_name);
// these only decide whether anything was revealed. A cohort's / anchor's / a
// member's position is fixed reading order, never importance.

import type {
  Cohort,
  GenerationAnchor,
  OrganizationGenerationsDocument,
  PersonCohortsDocument,
} from "./types";

// ---- M8.1: person co-presence ------------------------------------------

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

// ---- M8.2: institution co-presence -------------------------------------

export interface OrganizationGenerationsView {
  isEmpty: boolean;
  anchors: GenerationAnchor[];
}

/** A null document (read failed / absent) and an empty anchors array both read
 * as the same honest absence -- never an error, never a fabricated co-presence. */
export function buildOrganizationGenerationsView(
  document: OrganizationGenerationsDocument | null,
): OrganizationGenerationsView {
  if (document === null || document.anchors.length === 0) {
    return { isEmpty: true, anchors: [] };
  }
  return { isEmpty: false, anchors: document.anchors };
}

// Provenance labelling is the platform-shared kernel, re-exported so a revealed
// co-present person reads provenance identically to every other engine.
export { describeProvenance as describeRevelationProvenance } from "@/features/shared/provenance";
export type { ProvenanceDescriptor as RevelationProvenanceDescriptor } from "@/features/shared/provenance";
