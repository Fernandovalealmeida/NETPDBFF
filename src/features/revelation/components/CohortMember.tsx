import Link from "next/link";

import { Badge } from "@/components/ui/Badge";
import { ProvenanceAffordance } from "@/features/shared/ProvenanceAffordance";

import { describeParticipationHere, revelationSourceRecordLabel } from "../copy";
import { describeRevelationProvenance } from "../derive";
import type { CohortMember as CohortMemberType } from "../types";
import { RevealedPeriod } from "./RevealedPeriod";

// One documented cohort member: the other person (a link to their canonical
// page, a doorway back into the record), a deterministic one-sentence statement
// of their documented participation at this institution, the period, and
// provenance one gesture away. A provisional or disputed record renders a calm,
// visible verification Badge (never colour alone) so its state is legible
// without the tooltip. The member name is an h4 (under the cohort's h3), so the
// document outline never skips a level. The member is NEVER described as
// related to, collaborating with, or influenced by the focal person -- only as
// documentedly present at the same institution in an overlapping period. Server
// Component.
export interface CohortMemberProps {
  member: CohortMemberType;
}

export function CohortMember({ member }: CohortMemberProps) {
  const person = member.person;
  const provenance = describeRevelationProvenance(
    member.provenance.sourceType,
    member.provenance.verificationStatus,
  );
  const status = member.provenance.verificationStatus;
  const showBadge = status === "disputed" || status === "provisional";
  const badgeTone: "danger" | "warning" = status === "disputed" ? "danger" : "warning";

  return (
    <li className="border-l border-border-default pl-4">
      <h4 className="text-base font-medium text-foreground">
        {person.href ? (
          <Link href={person.href} className="underline underline-offset-2">
            {person.label}
          </Link>
        ) : (
          <span>{person.label}</span>
        )}
      </h4>
      <p className="mt-1 text-sm text-foreground">
        {describeParticipationHere(person.label, member.capacity)}
      </p>
      <RevealedPeriod temporal={member.temporal} />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {showBadge ? (
          <Badge tone={badgeTone} size="sm">
            {provenance.statusLabel}
          </Badge>
        ) : null}
        <ProvenanceAffordance
          subject={`${person.label}'s participation`}
          projectedFrom={revelationSourceRecordLabel(member.source.type)}
          sourceLabel={provenance.sourceLabel}
          statusLabel={provenance.statusLabel}
        />
      </div>
    </li>
  );
}
