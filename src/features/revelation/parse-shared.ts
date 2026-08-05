// Shared fail-closed parse primitives for the Revelation module. Harvested from
// M8.1's parse.ts once a SECOND co-presence lens (M8.2 institution-surface
// co-presence) demonstrated the exact same need -- the same discipline by which
// M6.3 extracted the temporal/provenance kernels after M6.2 and M6.3 both needed
// them. These parse the platform-shared shapes (ProjectedNode, the temporal
// kernel, the provenance envelope, a capacity ref, a decomposable participation
// anchor, and a co-present member) from untyped revelation jsonb, or null on an
// unrecognizable shape. Pure; unit-tested; fails closed; parsing only ever
// REMOVES, it never invents.

import type { ProjectedNode } from "@/features/network/types";
import {
  SOURCE_TYPES,
  VERIFICATION_STATUSES,
  type SourceType,
  type VerificationStatus,
} from "@/features/shared/provenance";
import { DATE_PRECISIONS, type DatePrecision, type TemporalValue } from "@/features/shared/temporal";

import type { CohortAnchor, CohortMember, RevelationCapacityRef } from "./types";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function asNonBlankString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

export function asBoolean(value: unknown): boolean {
  return value === true;
}

export function asPrecision(value: unknown): DatePrecision | null {
  return typeof value === "string" && (DATE_PRECISIONS as readonly string[]).includes(value)
    ? (value as DatePrecision)
    : null;
}

export function asSourceType(value: unknown): SourceType | null {
  return typeof value === "string" && (SOURCE_TYPES as readonly string[]).includes(value)
    ? (value as SourceType)
    : null;
}

export function asVerification(value: unknown): VerificationStatus | null {
  return typeof value === "string" && (VERIFICATION_STATUSES as readonly string[]).includes(value)
    ? (value as VerificationStatus)
    : null;
}

export function asVerificationOrNull(value: unknown): VerificationStatus | null {
  if (value === null || value === undefined) return null;
  return asVerification(value);
}

/** A revealed temporal is always PRESENT for the co-presence lenses (undated
 * participations are excluded by the read models); an unrecognizable temporal
 * therefore fails the element rather than degrading to null. */
export function parseTemporal(input: unknown): TemporalValue | null {
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
export function parseNode(input: unknown): ProjectedNode | null {
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

export function parseCapacity(input: unknown): RevelationCapacityRef | null {
  if (!isRecord(input)) return null;
  const key = asString(input.key);
  const label = asNonBlankString(input.label);
  if (key === null || label === null) return null;
  return { key, label };
}

/** A decomposable participation anchor: {id, capacity, temporal, provenance}. */
export function parseAnchor(input: unknown): CohortAnchor | null {
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

/** A co-present member: a person node, their participation's capacity/temporal/
 * provenance, and the exact canonical `participations` row that establishes the
 * overlap. Rejects a node that is not a person. */
export function parseMember(input: unknown): CohortMember | null {
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
