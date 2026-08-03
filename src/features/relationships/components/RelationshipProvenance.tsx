"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

// The relationship provenance affordance: reading stays calm; "how do we know
// this bond?" is one keyboard-operable gesture away, never an inline metadata
// wall (Product Blueprint, "Provenance surface"). The full provenance is
// carried by the trigger's ACCESSIBLE NAME (deterministic, server-rendered,
// and unique per bond via the counterpart's name) -- the visual tooltip is an
// enhancement, not the only accessible source. Mirrors the Timeline/
// Participation provenance pattern. Client Component: Radix Tooltip needs a
// provider ancestor, which this wraps itself.
export interface RelationshipProvenanceProps {
  counterpartName: string;
  sourceLabel: string;
  statusLabel: string;
}

export function RelationshipProvenance({ counterpartName, sourceLabel, statusLabel }: RelationshipProvenanceProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Provenance of the relationship with ${counterpartName}: ${sourceLabel}. ${statusLabel}.`}
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
