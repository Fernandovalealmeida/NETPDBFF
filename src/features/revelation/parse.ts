// Defensive parsers: untyped revelation jsonb -> typed reading projections, or
// null on an unrecognizable shape. Pure; unit-tested; fails closed. An
// individual malformed member or cohort is dropped (the rest still reads)
// rather than failing the whole document -- the same discipline as the M6/M7
// parsers. A dropped member is never a fabricated one: parsing only ever
// REMOVES; it never invents.

import type { ProjectedNode } from "@/features/network/types";
import {
  SOURCE_TYPES,
  VERIFICATION_STATUSES,
  type SourceType,
  type VerificationStatus,
} from "@/features/shared/provenance";
import { DATE_PRECISIONS, type DatePrecision, type TemporalValue } from "@/features/shared/temporal";

import type {
  Cohort,
  CohortAnchor,
  CohortMember,
  PersonCohortsDocument,
  RevelationCapacityRef,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNonBlankString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function asPrecision(value: unknown): DatePrecision | null {
  return typeof value === "string" && (DATE_PRECISIONS as readonly string[]).includes(value)
    ? (value as DatePrecision)
    : null;
}

function asSourceType(value: unknown): SourceType | null {
  return typeof value === "string" && (SOURCE_TYPES as readonly string[]).includes(value)
    ? (value as SourceType)
    : null;
}

function asVerification(value: unknown): VerificationStatus | null {
  return typeof value === "string" && (VERIFICATION_STATUSES as readonly string[]).includes(value)
    ? (value as VerificationStatus)
    : null;
}

function asVerificationOrNull(value: unknown): VerificationStatus | null {
  if (value === null || value === undefined) return null;
  return asVerification(value);
}

/** A revealed temporal is always PRESENT for the cohort lens (undated
 * participations are excluded by the read model); an unrecognizable temporal
 * therefore fails the element rather than degrading to null. */
function parseTemporal(input: unknown): TemporalValue | null {
  if (!isRecord(input)) return null;
  return {
    startDate: asString(input.start_date),
    startPrecision: asPrecision(input.start_precision),
    endDate: asString(input.end_date),
    endPrecision: asPrecision(input.end_precision),
    isApproximate: asBoolean(input.is_approximate),
    isOngoing: asBoolean(input.is_ongoing),
    dateIsUnknown: asBoolean(input.date_is_unknown),
    dateIsUncertain: asBoolean(input.date_is_uncertain),
  };
}

/** Parses a person/organization node in the shared ProjectedNode shape. */
function parseNode(input: unknown): ProjectedNode | null {
  if (!isRecord(input)) return null;
  const typeRaw = asString(input.type);
  const id = asString(input.id);
  const label = asNonBlankString(input.label);
  if ((typeRaw !== "person" && typeRaw !== "organization") || id === null || label === null) {
    return null;
  }
  return {
    type: typeRaw,
    id,
    label,
    secondaryLabel: asString(input.secondary_label),
    href: asString(input.href),
    verificationStatus: asVerificationOrNull(input.verification_status),
  };
}

function parseCapacity(input: unknown): RevelationCapacityRef | null {
  if (!isRecord(input)) return null;
  const key = asString(input.key);
  const label = asNonBlankString(input.label);
  if (key === null || label === null) return null;
  return { key, label };
}

function parseAnchor(input: unknown): CohortAnchor | null {
  if (!isRecord(input)) return null;
  const id = asString(input.id);
  if (id === null) return null;

  const capacity = parseCapacity(input.capacity);
  if (capacity === null) return null;

  const temporal = parseTemporal(input.temporal);
  if (temporal === null) return null;

  const provenanceRaw = input.provenance;
  if (!isRecord(provenanceRaw)) return null;
  const sourceType = asSourceType(provenanceRaw.source_type);
  const verificationStatus = asVerification(provenanceRaw.verification_status);
  if (sourceType === null || verificationStatus === null) return null;

  return { id, capacity, temporal, provenance: { sourceType, verificationStatus } };
}

function parseMember(input: unknown): CohortMember | null {
  if (!isRecord(input)) return null;

  const person = parseNode(input.person);
  if (person === null || person.type !== "person") return null;

  const capacity = parseCapacity(input.capacity);
  if (capacity === null) return null;

  const temporal = parseTemporal(input.temporal);
  if (temporal === null) return null;

  const provenanceRaw = input.provenance;
  if (!isRecord(provenanceRaw)) return null;
  const sourceType = asSourceType(provenanceRaw.source_type);
  const verificationStatus = asVerification(provenanceRaw.verification_status);
  if (sourceType === null || verificationStatus === null) return null;

  const sourceRaw = input.source;
  if (!isRecord(sourceRaw)) return null;
  const sourceTypeName = asNonBlankString(sourceRaw.type);
  const sourceId = asString(sourceRaw.id);
  if (sourceTypeName === null || sourceId === null) return null;

  return {
    person,
    capacity,
    temporal,
    provenance: { sourceType, verificationStatus },
    source: { type: sourceTypeName, id: sourceId },
  };
}

function parseCohort(input: unknown): Cohort | null {
  if (!isRecord(input)) return null;

  const organization = parseNode(input.organization);
  if (organization === null || organization.type !== "organization") return null;

  if (!Array.isArray(input.members)) return null;
  const members: CohortMember[] = [];
  for (const raw of input.members) {
    const member = parseMember(raw);
    if (member !== null) {
      members.push(member);
    }
  }
  // A cohort with no readable members is not a cohort -- drop it rather than
  // render an empty group (the read model already omits memberless cohorts;
  // this guards the parse layer too).
  if (members.length === 0) return null;

  const focalParticipations: CohortAnchor[] = [];
  if (Array.isArray(input.focal_participations)) {
    for (const raw of input.focal_participations) {
      const anchor = parseAnchor(raw);
      if (anchor !== null) {
        focalParticipations.push(anchor);
      }
    }
  }

  return { organization, focalParticipations, members };
}

export function parsePersonCohortsDocument(input: unknown): PersonCohortsDocument | null {
  if (!isRecord(input)) return null;
  const personId = asString(input.person_id);
  if (personId === null) return null;
  if (!Array.isArray(input.cohorts)) return null;

  const cohorts: Cohort[] = [];
  for (const raw of input.cohorts) {
    const cohort = parseCohort(raw);
    if (cohort !== null) {
      cohorts.push(cohort);
    }
  }

  return { personId, cohorts };
}
