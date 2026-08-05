import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import type { ProjectedNode } from "@/features/network/types";
import { ProvenanceAffordance } from "@/features/shared/ProvenanceAffordance";

import {
  describeContinuityOutcome,
  describeCoverageGap,
  describeCoverageSpan,
  revelationSourceRecordLabel,
} from "../copy";
import { describeRevelationProvenance } from "../derive";
import type { ContinuityPracticeView } from "../derive";
import type { CoverageGap } from "../types";
import { RevealedPeriod } from "./RevealedPeriod";

// One participation capacity's DOCUMENTED COVERAGE at the institution: the
// year-summarised spans the record covers, the evidentiary gaps between them,
// and the single honest outcome sentence read from the latest span (open-ended
// -> documented as still current; closed -> the record does not document what
// followed -- NEVER "ended"). Each span decomposes to its exact participation
// records: every person is a doorway, every record shows its own period and
// provenance one keyboard gesture away. A gap is stated as a silence in the
// record, never as a demonstrated interruption or end. Order is reading order
// (earliest first), never a ranking. The capacity is an h3 under the section's
// h2; records are list items, so the outline never skips a level. Server
// Component.

function PersonDoorway({ node }: { node: ProjectedNode }) {
  return node.href ? (
    <Link href={node.href} className="underline underline-offset-2">
      {node.label}
    </Link>
  ) : (
    <span>{node.label}</span>
  );
}

export interface PracticeCoverageProps {
  headingId: string;
  practice: ContinuityPracticeView;
}

export function PracticeCoverage({ headingId, practice }: PracticeCoverageProps) {
  const { capacity, spans, gaps, latestIsOpen } = practice;

  // A gap belongs after the closed span whose end year is the gap's from year
  // (spans do not overlap, so that end year is unique) -- robust to any span the
  // parser may have dropped, rather than assuming index alignment.
  function gapAfter(spanEndYear: number | null): CoverageGap | undefined {
    if (spanEndYear === null) return undefined;
    return gaps.find((g) => g.fromYear === spanEndYear);
  }

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId} className="text-sm font-medium text-foreground">
        {capacity.label}
      </h3>

      <ol className="mt-2 flex flex-col gap-4">
        {spans.map((span, index) => {
          const gap = gapAfter(span.endYear);
          return (
            <li key={`${capacity.key}-span-${index}`} className="flex flex-col gap-3">
              <div className="border-l-2 border-border-strong pl-4">
                <p className="text-sm font-medium text-foreground">{describeCoverageSpan(span)}</p>
                <ul className="mt-2 flex flex-col gap-3">
                  {span.participations.map((p) => {
                    const provenance = describeRevelationProvenance(
                      p.provenance.sourceType,
                      p.provenance.verificationStatus,
                    );
                    const status = p.provenance.verificationStatus;
                    const showBadge = status === "disputed" || status === "provisional";
                    const badgeTone: "danger" | "warning" =
                      status === "disputed" ? "danger" : "warning";

                    return (
                      <li key={p.source.id} className="border-l border-border-default pl-3">
                        <p className="text-sm text-foreground">
                          <PersonDoorway node={p.person} />
                        </p>
                        <RevealedPeriod temporal={p.temporal} />
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {showBadge ? (
                            <Badge tone={badgeTone} size="sm">
                              {provenance.statusLabel}
                            </Badge>
                          ) : null}
                          <ProvenanceAffordance
                            subject={`the participation record for ${p.person.label} here`}
                            projectedFrom={revelationSourceRecordLabel(p.source.type)}
                            sourceLabel={provenance.sourceLabel}
                            statusLabel={provenance.statusLabel}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
              {gap ? (
                <p className="border-l-2 border-dashed border-border-default pl-4 text-sm italic text-muted-foreground">
                  {describeCoverageGap(gap)}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="mt-3 text-sm text-muted-foreground">{describeContinuityOutcome(latestIsOpen)}</p>
    </section>
  );
}
