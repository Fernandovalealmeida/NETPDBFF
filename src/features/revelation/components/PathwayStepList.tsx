import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import type { ProjectedNode } from "@/features/network/types";
import { ProvenanceAffordance } from "@/features/shared/ProvenanceAffordance";

import { describePathwayStepRelation, revelationSourceRecordLabel } from "../copy";
import { describeRevelationProvenance } from "../derive";
import type { PathwayStep } from "../types";
import { RevealedPeriod } from "./RevealedPeriod";

// The ordered steps of ONE documented pathway. Each step is a single explicit
// assertion linking two entities, read in traversal order: "{from} — documented
// {category} ({label}) — {to}", with BOTH endpoints as doorways back into the
// record, the step's own period, and its provenance one keyboard gesture away.
// The list is the chain and nothing more; its order is traversal order, never a
// rank. The chain asserts nothing about its two ends beyond the literal steps
// shown (the endpoint rule) -- that framing lives in the section's summary and
// limits, so each step here reads plainly and structurally. An ordered list (ol)
// makes the sequence legible; steps are list items under the section's headings,
// so the outline never skips a level. Server Component.

function Doorway({ node }: { node: ProjectedNode }) {
  return node.href ? (
    <Link href={node.href} className="underline underline-offset-2">
      {node.label}
    </Link>
  ) : (
    <span>{node.label}</span>
  );
}

export interface PathwayStepListProps {
  steps: PathwayStep[];
}

export function PathwayStepList({ steps }: PathwayStepListProps) {
  return (
    <ol className="flex flex-col gap-4">
      {steps.map((step, index) => {
        const provenance = describeRevelationProvenance(
          step.provenance.sourceType,
          step.provenance.verificationStatus,
        );
        const status = step.provenance.verificationStatus;
        const showBadge = status === "disputed" || status === "provisional";
        const badgeTone: "danger" | "warning" = status === "disputed" ? "danger" : "warning";

        return (
          <li key={`${step.source.type}-${step.source.id}-${index}`} className="border-l border-border-default pl-4">
            <p className="text-sm text-foreground">
              <Doorway node={step.from} /> — {describePathwayStepRelation(step)} —{" "}
              <Doorway node={step.to} />.
            </p>
            <RevealedPeriod temporal={step.temporal} />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {showBadge ? (
                <Badge tone={badgeTone} size="sm">
                  {provenance.statusLabel}
                </Badge>
              ) : null}
              <ProvenanceAffordance
                subject={`the record linking ${step.from.label} and ${step.to.label}`}
                projectedFrom={revelationSourceRecordLabel(step.source.type)}
                sourceLabel={provenance.sourceLabel}
                statusLabel={provenance.statusLabel}
              />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
