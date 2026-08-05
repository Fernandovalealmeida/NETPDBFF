// Centralized, honest, Node-neutral copy for the Revelation surfaces, and the
// DETERMINISTIC derivation of a revealed element's one-sentence explanation. No
// AI-generated prose (a revealed person reads only from what its participation
// Assertion supports); no social/engagement language; no metric, ranking,
// prestige, popularity, influence, similarity, recommendation, or "most
// connected" language anywhere. Unit-tested for Node-neutrality and the absence
// of that vocabulary.
//
// The co-presence lenses state plainly that they show a DOCUMENTED co-presence --
// a record that people were at the same institution in overlapping years -- and
// NOT that they knew one another, worked together, or formed a group (that would
// be inference/interpretation, which M8 refuses). They also state that the
// co-presence shown is the DOCUMENTED one, not the true one, and that absence is
// never proof no co-presence exists. Per the M8 Specification's structural-naming
// rule (Spec Sec.2 flags calling a documented cohort "a generation" as
// interpretation), the institution surface says "documented co-presence", never
// "generation".

import type { LineageStep, RevelationCapacityRef } from "./types";

export const revelationCopy = {
  // M8.1 -- person co-presence.
  personCohorts: {
    title: "Documented cohorts",
    whatThisShows:
      "Other people documented at the same institutions as this person, during " +
      "periods that overlap this person's. This is a documented co-presence — a " +
      "record that they were there in the same years — not a record that they " +
      "knew one another, worked together, or formed a group.",
    empty: {
      title: "No documented cohorts yet",
      description:
        "No other person is yet recorded at the same institution as this person " +
        "during an overlapping period. This is an honest absence, not a claim " +
        "that there was none — it shows only co-presence supported by dated, " +
        "explicit participation records.",
    },
    limitsHeading: "Limits of this view",
    limits:
      "This shows the documented cohort, not the true one. It is composed only " +
      "from dated, explicit participation records preserved on this platform, so " +
      "people who were present but never recorded — or recorded without dates — " +
      "do not appear. Overlapping periods mean the records place these people at " +
      "the same institution in the same years; they do not, by themselves, mean " +
      "the people met or worked together. Absence from this view is never proof " +
      "that no co-presence exists.",
    membersHeading: "Documented here at the same time",
    anchorHeading: "This person's participation here",
  },

  // M8.2 -- institution co-presence.
  organizationGenerations: {
    title: "Documented co-presence",
    whatThisShows:
      "People the record documents at this institution at the same time as one " +
      "another — each shown with the others whose documented period here overlaps " +
      "theirs. This is a documented co-presence — a record that they were here in " +
      "the same years — not a record that they knew one another, worked together, " +
      "or formed a group.",
    empty: {
      title: "No documented co-presence yet",
      description:
        "No two people are yet recorded at this institution during an overlapping " +
        "period. This is an honest absence, not a claim that there was none — it " +
        "shows only co-presence supported by dated, explicit participation records.",
    },
    limitsHeading: "Limits of this view",
    limits:
      "This shows the documented co-presence, not the true one. It is composed " +
      "only from dated, explicit participation records preserved on this platform, " +
      "so people who were present but never recorded — or recorded without dates — " +
      "do not appear. Overlapping periods mean the records place these people here " +
      "in the same years; they do not, by themselves, mean the people met or " +
      "worked together. Absence from this view is never proof that no co-presence " +
      "exists.",
    participationsHeading: "Documented here",
    coPresentHeading: "Documented here at the same time",
  },

  // M8.3 -- institutional succession/formation descent.
  organizationLineage: {
    title: "Documented institutional descent",
    whatThisShows:
      "A documented chain of succession and formation records connecting this " +
      "institution to others — those the record places before it, and those it " +
      "places after it. It records what came before what, not what caused or gave " +
      "rise to what; the meaning of a succession is left to a historian.",
    empty: {
      title: "No documented descent yet",
      description:
        "No succession or formation record yet connects this institution to " +
        "another. This is an honest absence, not a claim that it had no predecessor " +
        "or successor — it shows only descent supported by explicit, directional " +
        "institutional records.",
    },
    limitsHeading: "Limits of this view",
    limits:
      "This shows the documented descent, not the true one. It is composed only " +
      "from explicit succession and formation records preserved on this platform, " +
      "and follows them only as far as they are recorded; a gap is a silence in the " +
      "record, never proof that no link existed. It records the order the records " +
      "document — never what followed from what, which is a matter of historical " +
      "judgement.",
    subjectLabel: "The institution you are reading",
    upstreamHeading: "Documented antecedents",
    downstreamHeading: "Documented successors",
  },

  // M8.3 -- documented mentorship descent.
  personMentorshipLineage: {
    title: "Documented mentorship lineage",
    whatThisShows:
      "A documented chain of mentorship records connecting this person to others — " +
      "the mentors the record places before them, and the students it places after " +
      "them. It records who mentored whom, and nothing about what a mentorship " +
      "passed on or what it meant.",
    empty: {
      title: "No documented mentorship lineage yet",
      description:
        "No mentorship record yet connects this person to a mentor or a student. " +
        "This is an honest absence, not a claim that there was none — it shows only " +
        "mentorship supported by explicit, directional records.",
    },
    limitsHeading: "Limits of this view",
    limits:
      "This shows the documented mentorship lineage, not the true one. It is " +
      "composed only from explicit mentorship records preserved on this platform, " +
      "and follows them only as far as they are recorded; a gap is a silence in the " +
      "record, never proof that no link existed. It records who mentored whom — " +
      "never what a mentorship passed on or what it meant, which is a matter of " +
      "historical judgement.",
    subjectLabel: "The person you are reading",
    upstreamHeading: "Documented mentors",
    downstreamHeading: "Documented students",
  },
} as const;

function lower(value: string): string {
  return value.toLowerCase();
}

function article(word: string): string {
  return /^[aeiou]/i.test(word.trim()) ? "an" : "a";
}

/**
 * Deterministic one-sentence statement of a documented participation at the
 * institution ("here"), from the record's own capacity. Used for a cohort
 * member, an institution participant, and an anchor. Uses ONLY the capacity
 * label the participation Assertion supplies; asserts nothing beyond the
 * documented belonging (dates are carried by the separate period line, not
 * here). No inference, no relationship claim.
 */
export function describeParticipationHere(subject: string, capacity: RevelationCapacityRef): string {
  const cap = lower(capacity.label);
  return `${subject} participated here as ${article(cap)} ${cap}.`;
}

/** Human phrase for the canonical record a revealed element decomposes to, used
 * in the provenance disclosure so a reader learns which canonical engine the
 * element was projected from. Deterministic; never cites the revelation itself. */
export function revelationSourceRecordLabel(type: string): string {
  switch (type) {
    case "participations":
      return "participation record";
    case "relationships":
      return "relationship record";
    case "organization_relationships":
      return "institutional relationship record";
    default:
      return "documented record";
  }
}

/**
 * Deterministic one-sentence reading of a lineage step, in the assertion's own
 * direction, from the kind vocabulary's source-role label ("Predecessor",
 * "Mentor", "Antecedent body", …). "{from} is a documented {role} of {to}."
 * Asserts only the documented directional relation the record carries; nothing
 * about transmission, cause, or meaning. Node-neutral (the role word is data).
 */
export function describeLineageStep(step: LineageStep): string {
  const role = lower(step.kind.sourceRole);
  return `${step.from.label} is a documented ${role} of ${step.to.label}.`;
}
