// Domain types for the Timeline Engine (Milestone M6.2).
//
// An Event is standalone historical content; a person timeline is the
// projection of events onto one person (Many-Clocks). Every event is an
// Assertion carrying its own provenance + verification -- an event row never
// implies truth. No Participation/Relationship types here (CC1): later engines.

export type SourceType =
  | "self_reported"
  | "nominated_by_other"
  | "admin_entered"
  | "imported_historical";

export const SOURCE_TYPES: readonly SourceType[] = [
  "self_reported",
  "nominated_by_other",
  "admin_entered",
  "imported_historical",
];

export type EventVerificationStatus = "provisional" | "verified_self" | "verified_admin" | "disputed";

export const EVENT_VERIFICATION_STATUSES: readonly EventVerificationStatus[] = [
  "provisional",
  "verified_self",
  "verified_admin",
  "disputed",
];

export type DatePrecision = "day" | "month" | "year" | "decade";

export const DATE_PRECISIONS: readonly DatePrecision[] = ["day", "month", "year", "decade"];

export interface EventKindRef {
  key: string;
  label: string;
}

/** The four non-conflated temporal concepts (precision, approximation,
 * uncertainty, missing) plus intervals and open-ended periods. */
export interface EventTemporal {
  startDate: string | null;
  startPrecision: DatePrecision | null;
  endDate: string | null;
  endPrecision: DatePrecision | null;
  isApproximate: boolean;
  isOngoing: boolean;
  dateIsUnknown: boolean;
  dateIsUncertain: boolean;
}

export interface EventProvenanceInfo {
  sourceType: SourceType;
  verificationStatus: EventVerificationStatus;
}

export interface TimelineEvent {
  id: string;
  kind: EventKindRef;
  title: string;
  summary: string | null;
  place: string | null;
  temporal: EventTemporal;
  provenance: EventProvenanceInfo;
}

/** Canonical person-timeline read document (from get_person_timeline). Events
 * arrive chronologically ordered, undated last. */
export interface TimelineDocument {
  personId: string;
  events: TimelineEvent[];
}
