// The core temporal engine: turns an EventTemporal into an honest,
// human-readable descriptor. Pure and dependency-free (unit-tested in
// tests/unit/timeline-temporal.test.ts). It keeps FOUR concepts distinct and
// never conflates them: precision (imprecision), approximation ("circa"),
// uncertainty (proposed-but-unconfirmed date), and missing (undated) -- plus
// intervals and open-ended periods. Node-neutral: no locale/institution
// assumptions beyond English month names (i18n is a later concern).

import type { DatePrecision, EventTemporal } from "./types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export type TemporalKind = "exact" | "month" | "year" | "decade" | "range" | "ongoing" | "unknown";

export interface TemporalDescriptor {
  /** Human date string, e.g. "c. 1987 – present" or "Date unknown". */
  label: string;
  kind: TemporalKind;
  /** Has an end or is open-ended. */
  isInterval: boolean;
  isApproximate: boolean;
  isUncertain: boolean;
  isUnknown: boolean;
  /** Short note distinguishing approximation/uncertainty; null when neither. */
  certaintyNote: string | null;
}

function parseISO(dateISO: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateISO);
  if (!match) {
    return null;
  }
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function monthName(month: number): string {
  return MONTHS[month - 1] ?? "";
}

/** Formats a single date point at its precision, never inventing precision it
 * does not have: a year-precision date renders as "1987", never "1 Jan 1987". */
export function formatPoint(dateISO: string, precision: DatePrecision): string {
  const parsed = parseISO(dateISO);
  if (!parsed) {
    return dateISO;
  }
  switch (precision) {
    case "day":
      return `${parsed.day} ${monthName(parsed.month)} ${parsed.year}`.trim();
    case "month":
      return `${monthName(parsed.month)} ${parsed.year}`.trim();
    case "year":
      return `${parsed.year}`;
    case "decade":
      return `${Math.floor(parsed.year / 10) * 10}s`;
  }
}

export function formatTemporal(temporal: EventTemporal): TemporalDescriptor {
  // Missing is its own first-class state.
  if (temporal.dateIsUnknown || temporal.startDate === null || temporal.startPrecision === null) {
    return {
      label: "Date unknown",
      kind: "unknown",
      isInterval: false,
      isApproximate: false,
      isUncertain: false,
      isUnknown: true,
      certaintyNote: null,
    };
  }

  const start = formatPoint(temporal.startDate, temporal.startPrecision);
  const isInterval = temporal.isOngoing || temporal.endDate !== null;

  let dateStr: string;
  let kind: TemporalKind;
  if (temporal.isOngoing) {
    dateStr = `${start} – present`;
    kind = "ongoing";
  } else if (temporal.endDate !== null && temporal.endPrecision !== null) {
    dateStr = `${start} – ${formatPoint(temporal.endDate, temporal.endPrecision)}`;
    kind = "range";
  } else {
    dateStr = start;
    if (temporal.startPrecision === "day") {
      kind = "exact";
    } else {
      kind = temporal.startPrecision;
    }
  }

  // Approximation ("circa") is a prefix on the whole dating; uncertainty is a
  // separate note. The two are independent and both preserved distinctly.
  const label = temporal.isApproximate ? `c. ${dateStr}` : dateStr;

  let certaintyNote: string | null = null;
  if (temporal.isApproximate && temporal.dateIsUncertain) {
    certaintyNote = "Approximate and unconfirmed date.";
  } else if (temporal.isApproximate) {
    certaintyNote = "Approximate date.";
  } else if (temporal.dateIsUncertain) {
    certaintyNote = "Proposed date, not yet confirmed.";
  }

  return {
    label,
    kind,
    isInterval,
    isApproximate: temporal.isApproximate,
    isUncertain: temporal.dateIsUncertain,
    isUnknown: false,
    certaintyNote,
  };
}
