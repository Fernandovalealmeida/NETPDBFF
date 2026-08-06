// Defensive parser for the M8.5 recurrence documents (a person's / an
// institution's documented repeated phenomena): untyped revelation jsonb -> typed
// reading projection, or null on an unrecognizable shape. Same fail-closed
// discipline as the other revelation parsers: an individual malformed occurrence
// or group is dropped (the rest still reads); parsing only ever REMOVES, never
// invents. Reuses the shared node/temporal/provenance primitives -- occurrence
// and anchor nodes use parseAnyNode (a recurrence occurrence may be a contribution
// or event node, not only person/organization).
//
// Recurrence-specific fail-closed rules, so what is shown is always honest:
//   * a group needs >= 2 surviving decomposable occurrences (recurrence is never
//     "once"); a group that drops below two after parsing is removed;
//   * the reported `count` is set to the number of surviving occurrences, so a
//     count can never exceed the occurrences a reader can actually decompose;
//   * a `role` group must carry its institution anchor (an organization node);
//     an event/contribution group carries no anchor.

import {
  isRecord,
  asString,
  asNonBlankString,
  asSourceType,
  asVerification,
  parseAnyNode,
  parseTemporal,
} from "./parse-shared";
import type {
  OrganizationRecurrenceDocument,
  PersonRecurrenceDocument,
  RecurrenceCategory,
  RecurrenceGroup,
  RecurrenceOccurrence,
} from "./types";

const CATEGORIES: readonly RecurrenceCategory[] = ["role", "event", "contribution"];

function parseOccurrence(input: unknown): RecurrenceOccurrence | null {
  if (!isRecord(input)) return null;

  const sourceRaw = input.source;
  if (!isRecord(sourceRaw)) return null;
  const sourceType = asNonBlankString(sourceRaw.type);
  const sourceId = asString(sourceRaw.id);
  if (sourceType === null || sourceId === null) return null;

  const temporal = parseTemporal(input.temporal);
  if (temporal === null) return null;

  const provenanceRaw = input.provenance;
  if (!isRecord(provenanceRaw)) return null;
  const provSourceType = asSourceType(provenanceRaw.source_type);
  const verificationStatus = asVerification(provenanceRaw.verification_status);
  if (provSourceType === null || verificationStatus === null) return null;

  // The node is optional (a role occurrence has none); when present it must be a
  // valid node of any canonical type. A present-but-malformed node fails the
  // occurrence rather than being silently dropped to null.
  let node = null;
  if (input.node !== null && input.node !== undefined) {
    node = parseAnyNode(input.node);
    if (node === null) return null;
  }

  return {
    source: { type: sourceType, id: sourceId },
    node,
    temporal,
    provenance: { sourceType: provSourceType, verificationStatus },
  };
}

function parseGroup(input: unknown): RecurrenceGroup | null {
  if (!isRecord(input)) return null;

  const category =
    typeof input.category === "string" && (CATEGORIES as readonly string[]).includes(input.category)
      ? (input.category as RecurrenceCategory)
      : null;
  if (category === null) return null;

  const label = asNonBlankString(input.label);
  if (label === null) return null;

  // A role recurrence must carry its institution anchor (an organization node);
  // event/contribution recurrences carry none.
  let anchor = null;
  if (input.anchor !== null && input.anchor !== undefined) {
    anchor = parseAnyNode(input.anchor);
    if (anchor === null) return null;
  }
  if (category === "role" && (anchor === null || anchor.type !== "organization")) return null;

  if (!Array.isArray(input.occurrences)) return null;
  const occurrences: RecurrenceOccurrence[] = [];
  for (const item of input.occurrences) {
    const occ = parseOccurrence(item);
    if (occ !== null) occurrences.push(occ);
  }
  // Recurrence requires at least two decomposable occurrences. The count is the
  // number actually shown, so it never overstates what a reader can decompose.
  if (occurrences.length < 2) return null;

  return { category, label, anchor, count: occurrences.length, occurrences };
}

function parseGroups(raw: unknown): RecurrenceGroup[] {
  if (!Array.isArray(raw)) return [];
  const groups: RecurrenceGroup[] = [];
  for (const item of raw) {
    const group = parseGroup(item);
    if (group !== null) groups.push(group);
  }
  return groups;
}

export function parsePersonRecurrenceDocument(input: unknown): PersonRecurrenceDocument | null {
  if (!isRecord(input)) return null;

  const personId = asString(input.person_id);
  if (personId === null) return null;

  const person = parseAnyNode(input.person);
  if (person === null || person.type !== "person") return null;

  if (!Array.isArray(input.groups)) return null;

  return { personId, person, groups: parseGroups(input.groups) };
}

export function parseOrganizationRecurrenceDocument(
  input: unknown,
): OrganizationRecurrenceDocument | null {
  if (!isRecord(input)) return null;

  const organizationId = asString(input.organization_id);
  if (organizationId === null) return null;

  const organization = parseAnyNode(input.organization);
  if (organization === null || organization.type !== "organization") return null;

  if (!Array.isArray(input.groups)) return null;

  return { organizationId, organization, groups: parseGroups(input.groups) };
}
