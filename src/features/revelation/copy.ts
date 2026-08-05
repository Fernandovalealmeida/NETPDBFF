// Centralized, honest, Node-neutral copy for the Revelation surfaces, and the
// DETERMINISTIC derivation of a revealed element's one-sentence explanation. No
// AI-generated prose (a cohort member reads only from what its participation
// Assertion supports); no social/engagement language; no metric, ranking,
// prestige, popularity, influence, similarity, recommendation, or "most
// connected" language anywhere. Unit-tested for Node-neutrality and the absence
// of that vocabulary.
//
// The co-presence lens states plainly that it shows a DOCUMENTED co-presence --
// a record that people were at the same institution in overlapping years -- and
// NOT that they knew one another, worked together, or formed a group (that
// would be inference/interpretation, which M8 refuses). It also states that the
// cohort shown is the DOCUMENTED cohort, not the true one, and that absence is
// never proof no co-presence exists.

import type { RevelationCapacityRef } from "./types";

export const revelationCopy = {
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
} as const;

function lower(value: string): string {
  return value.toLowerCase();
}

function article(word: string): string {
  return /^[aeiou]/i.test(word.trim()) ? "an" : "a";
}

/**
 * Deterministic one-sentence statement of a documented participation at the
 * cohort's institution ("here"), from the record's own capacity. Used for both
 * a cohort member and the focal person's anchor. Uses ONLY the capacity label
 * the participation Assertion supplies; asserts nothing beyond the documented
 * belonging (dates are carried by the separate period line, not here). No
 * inference, no relationship claim.
 */
export function describeParticipationHere(subject: string, capacity: RevelationCapacityRef): string {
  const cap = lower(capacity.label);
  return `${subject} participated here as ${article(cap)} ${cap}.`;
}

/** Human phrase for the canonical record a revealed member decomposes to, used
 * in the provenance disclosure so a reader learns which canonical engine the
 * element was projected from. Deterministic; never cites the revelation itself. */
export function revelationSourceRecordLabel(type: string): string {
  switch (type) {
    case "participations":
      return "participation record";
    default:
      return "documented record";
  }
}
