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
// COHORTS a person belonged to. M8.2 implements the SAME co-presence relation
// from the institution's vantage: the DOCUMENTED CO-PRESENCE within one
// institution (which participants the record places there at the same time as
// which others). Each cohort member / co-present person carries the exact
// canonical participations Assertion that establishes the overlap (its `source`),
// so the pattern decomposes to evidence. Co-presence is a documented co-presence,
// never an asserted relationship.
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

/** A documented participation anchor -- a person's own participation that
 * anchors a co-presence (the focal person's participation in a cohort, or an
 * institution participant's participation there), shown so a reader can see both
 * sides of the overlap. */
export interface CohortAnchor {
  id: string;
  capacity: RevelationCapacityRef;
  temporal: TemporalValue;
  provenance: ProvenanceInfo;
}

/** One co-present person: another person whose documented participation at the
 * shared institution overlaps the anchor's, together with the exact
 * participation that establishes it. In M8.1 this is a cohort member (from the
 * focal person's vantage); in M8.2 it is a co-present participant (from the
 * institution's vantage). The same shape and the same evidence contract. */
export interface CohortMember {
  /** The person as a reading destination (reuses the M7 node shape). */
  person: ProjectedNode;
  capacity: RevelationCapacityRef;
  temporal: TemporalValue;
  provenance: ProvenanceInfo;
  /** The canonical participations row that establishes the overlap. */
  source: RevelationSourceRef;
}

// ---- M8.1: person co-presence (documented cohorts) ----------------------

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

// ---- M8.2: institution co-presence (documented co-presence) -------------

/** One participant of a focal institution, as an anchor: the person, ALL of
 * their own documented participations at this institution (both sides of every
 * overlap are decomposable), and the other people the record places here at the
 * same time (each a co-present person, reusing CohortMember). */
export interface GenerationAnchor {
  /** The participant as a reading destination (reuses the M7 node shape). */
  person: ProjectedNode;
  /** All of this participant's documented participations at the focal institution. */
  participations: CohortAnchor[];
  /** Others documented at this institution during a period overlapping theirs. */
  coPresent: CohortMember[];
}

/** The institution co-presence revelation document for one institution (from
 * reveal_organization_generations): the focal institution and its participants
 * (each with the others documented here at the same time), in neutral order. An
 * empty anchors array is an honest absence, not a claim that none exist. */
export interface OrganizationGenerationsDocument {
  organizationId: string;
  /** The focal institution as a reading destination (a doorway back to itself). */
  organization: ProjectedNode;
  anchors: GenerationAnchor[];
}
