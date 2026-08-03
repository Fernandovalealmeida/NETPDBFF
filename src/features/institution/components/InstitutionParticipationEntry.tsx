import { describeInstitutionProvenance } from "../derive";
import type { InstitutionParticipationEntry as EntryModel } from "../types";
import { InstitutionPeriod } from "./InstitutionPeriod";
import { InstitutionProvenance } from "./InstitutionProvenance";

// One person's participation, seen from the institution: the person (the "who"
// -- the headline, an h4 under the capacity group's h3), the period, optional
// context, and provenance. Every participation, of every capacity, is given
// equal dignity -- a mateiro, technician, or field assistant reads exactly like
// a director. Server Component.
export function InstitutionParticipationEntry({ entry }: { entry: EntryModel }) {
  const provenance = describeInstitutionProvenance(entry.provenance.sourceType, entry.provenance.verificationStatus);

  return (
    <li className="border-l border-border-default pl-4">
      <h4 className="text-base font-medium text-foreground">{entry.person.displayName}</h4>
      <InstitutionPeriod temporal={entry.temporal} />
      {entry.summary ? (
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">{entry.summary}</p>
      ) : null}
      <div className="mt-2">
        <InstitutionProvenance
          subject={`${entry.person.displayName}'s participation`}
          sourceLabel={provenance.sourceLabel}
          statusLabel={provenance.statusLabel}
        />
      </div>
    </li>
  );
}
