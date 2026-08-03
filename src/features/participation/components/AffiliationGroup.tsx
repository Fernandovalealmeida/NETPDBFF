import type { Participation as ParticipationModel } from "../types";
import { ParticipationEntry } from "./ParticipationEntry";

// One organization the person belonged to (the "where"), heading a list of the
// belongings held there. A person may hold several -- sequential stints and
// concurrent appointments -- so this is always a list, never a single
// role/range (CLAUDE.md). The organization name leads; its short form, when
// one exists, sits quietly beside it. Server Component.
export interface AffiliationGroupProps {
  organizationName: string;
  organizationShortName: string | null;
  participations: ParticipationModel[];
}

export function AffiliationGroup({ organizationName, organizationShortName, participations }: AffiliationGroupProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">
        {organizationName}
        {organizationShortName ? (
          <span className="ml-2 text-xs font-normal text-muted-foreground">({organizationShortName})</span>
        ) : null}
      </h3>
      <ul className="mt-3 flex flex-col gap-6">
        {participations.map((participation) => (
          <ParticipationEntry key={participation.id} participation={participation} />
        ))}
      </ul>
    </div>
  );
}
