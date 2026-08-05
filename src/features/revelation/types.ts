// Domain types for the Revelation Engine (Milestone M8).
//
// M8 REVEALS what the record already demonstrates: it composes several
// already-preserved, already-connected explicit Assertions into the
// deterministic patterns their JOINT truth ENTAILS, each decomposable without
// remainder back to those Assertions. It is NOT inference, recommendation,
// ranking, or interpretation. See the M8 Definitive Specification and
// docs/decisions/0018-revelation-engine.md.
//
// M8.1 implements ONE lens -- co-presence -- on the person: the DOCUMENTED
// COHORTS a person belonged to. A cohort is the set of other people whose
// participation at the SAME institution has a documented period OVERLAPPING the
// focal person's. Each cohort member carries the exact canonical participations
// Assertion that establishes the overlap (its `source`), so the pattern
// decomposes to evidence. Co-presence is a documented co-presence, never an
// asserted relationship.
//
// The person/organization node shape reuses the M7 ProjectedNode; the temporal
// and provenance shapes are the platform-shared kernels (src/features/shared).

import type { ProjectedNode } from "@/features/network/types";
import type { ProvenanceInfo } from "@/features/shared/provenance";
import type { TemporalValue } from "@/features/shared/temporal";

/** The generic, data-driven capacity of a participation (from
 * participation_capacities), resolved by the read model. */
export interface RevelationCapacityRef {
  key: string;
  label: string;
}

/** Pointer to the exact canonical row that a revealed element decomposes to.
 * For a cohort member this is the `participations` row establishing the
 * overlap. This is what keeps the revelation decomposable and non-circular: it
 * points at canonical evidence, never at the pattern. */
export interface RevelationSourceRef {
  /** The canonical table the Assertion lives in, e.g. "participations". */
  type: string;
  id: string;
}

/** The focal person's own anchoring participation at a cohort's institution --
 * the evidence for WHY the focal person is part of this institution's cohort,
 * shown so a reader can see both sides of the overlap. */
export interface CohortAnchor {
  id: string;
  capacity: RevelationCapacityRef;
  temporal: TemporalValue;
  provenance: ProvenanceInfo;
}

/** One member of a documented cohort: another person whose documented
 * participation at the shared institution overlaps the focal person's, together
 * with the exact participation that establishes it. */
export interface CohortMember {
  /** The member person as a reading destination (reuses the M7 node shape). */
  person: ProjectedNode;
  capacity: RevelationCapacityRef;
  temporal: TemporalValue;
  provenance: ProvenanceInfo;
  /** The canonical participations row that establishes the overlap. */
  source: RevelationSourceRef;
}

/** A documented cohort at one institution: the institution, the focal person's
 * anchoring participation(s) there, and the members whose documented periods
 * overlap. */
export interface Cohort {
  /** The shared institution as a reading destination (reuses the node shape). */
  organization: ProjectedNode;
  focalParticipations: CohortAnchor[];
  members: CohortMember[];
}

/** The co-presence revelation document for one person (from
 * reveal_person_cohorts): the documented cohorts, in neutral order. An empty
 * cohorts array is an honest absence, not a claim that none exist. */
export interface PersonCohortsDocument {
  personId: string;
  cohorts: Cohort[];
}
