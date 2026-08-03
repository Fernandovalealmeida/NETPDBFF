// Pure presentation derivation for the timeline: chronological grouping,
// undated handling, and provenance labels. No I/O, no JSX. Unit-tested.
//
// Navigation rule (documented in docs/m6.2-timeline-engine.md): events are
// grouped under decade headings ONLY when the timeline spans two or more
// distinct decades -- a short timeline is not burdened with anchors, a long
// one stays orientable. Undated events are never dropped: they appear in a
// final "Date unknown" group, in order, without falsifying chronology.

import { timelineCopy } from "./copy";
import type {
  EventVerificationStatus,
  SourceType,
  TimelineDocument,
  TimelineEvent,
} from "./types";

export interface TimelinePeriodGroup {
  /** Stable key for React and anchors. */
  key: string;
  /** Heading label ("1980s", "Date unknown"), or "" for an unlabeled single group. */
  label: string;
  events: TimelineEvent[];
}

export interface TimelineView {
  isEmpty: boolean;
  /** True when decade headings are used (multi-decade timeline). */
  grouped: boolean;
  periods: TimelinePeriodGroup[];
  eventCount: number;
}

function startYear(event: TimelineEvent): number | null {
  const { startDate } = event.temporal;
  if (event.temporal.dateIsUnknown || startDate === null) return null;
  const match = /^(\d{4})/.exec(startDate);
  return match ? Number(match[1]) : null;
}

function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

export function buildTimelineView(document: TimelineDocument): TimelineView {
  const events = document.events;
  if (events.length === 0) {
    return { isEmpty: true, grouped: false, periods: [], eventCount: 0 };
  }

  const dated: TimelineEvent[] = [];
  const undated: TimelineEvent[] = [];
  for (const event of events) {
    if (startYear(event) === null) {
      undated.push(event);
    } else {
      dated.push(event);
    }
  }

  const distinctDecades = new Set<number>();
  for (const event of dated) {
    const year = startYear(event);
    if (year !== null) distinctDecades.add(decadeOf(year));
  }
  const grouped = distinctDecades.size >= 2;

  const periods: TimelinePeriodGroup[] = [];

  if (grouped) {
    const byDecade = new Map<number, TimelineEvent[]>();
    for (const event of dated) {
      const year = startYear(event);
      if (year === null) continue;
      const decade = decadeOf(year);
      const bucket = byDecade.get(decade) ?? [];
      bucket.push(event);
      byDecade.set(decade, bucket);
    }
    for (const decade of [...byDecade.keys()].sort((a, b) => a - b)) {
      periods.push({ key: `decade-${decade}`, label: `${decade}s`, events: byDecade.get(decade) ?? [] });
    }
  } else if (dated.length > 0) {
    periods.push({ key: "all", label: "", events: dated });
  }

  if (undated.length > 0) {
    periods.push({ key: "undated", label: timelineCopy.undatedGroupLabel, events: undated });
  }

  return { isEmpty: false, grouped, periods, eventCount: events.length };
}

const SOURCE_LABEL: Record<SourceType, string> = {
  self_reported: "Self-provided",
  nominated_by_other: "Submitted by another member",
  admin_entered: "Entered by an administrator",
  imported_historical: "Imported from historical records",
};

const VERIFICATION_LABEL: Record<EventVerificationStatus, string> = {
  provisional: "Awaiting review",
  verified_self: "Verified by the person",
  verified_admin: "Verified by an administrator",
  disputed: "Disputed",
};

export interface EventProvenanceDescriptor {
  sourceLabel: string;
  statusLabel: string;
}

export function describeEventProvenance(
  sourceType: SourceType,
  verificationStatus: EventVerificationStatus,
): EventProvenanceDescriptor {
  return { sourceLabel: SOURCE_LABEL[sourceType], statusLabel: VERIFICATION_LABEL[verificationStatus] };
}
