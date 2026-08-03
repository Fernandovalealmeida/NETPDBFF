"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

// The institution provenance affordance: reading stays calm; "how do we know
// this?" is one keyboard-operable gesture away. The full provenance is carried
// by the trigger's ACCESSIBLE NAME (deterministic, server-rendered, unique per
// subject) -- the visual tooltip is an enhancement, not the only accessible
// source. Mirrors the Timeline/Participation/Relationship provenance pattern.
// Client Component.
export interface InstitutionProvenanceProps {
  subject: string;
  sourceLabel: string;
  statusLabel: string;
}

export function InstitutionProvenance({ subject, sourceLabel, statusLabel }: InstitutionProvenanceProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Provenance of ${subject}: ${sourceLabel}. ${statusLabel}.`}
            className="inline-flex items-center gap-1 rounded-sm text-xs text-muted-foreground underline decoration-dotted underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Source
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span className="block font-medium text-foreground">{sourceLabel}</span>
          <span className="block text-muted-foreground">{statusLabel}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
