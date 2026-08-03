"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

// The participation provenance affordance: reading stays calm; "how do we know
// this belonging?" is one keyboard-operable gesture away, never an inline
// metadata wall (Product Blueprint, "Provenance surface"). Mirrors the
// Timeline's EventProvenance -- the established per-feature provenance pattern.
// Client Component: Radix Tooltip needs a provider ancestor, which this wraps
// itself.
export interface ParticipationProvenanceProps {
  sourceLabel: string;
  statusLabel: string;
}

export function ParticipationProvenance({ sourceLabel, statusLabel }: ParticipationProvenanceProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Provenance of this participation: ${sourceLabel}. ${statusLabel}.`}
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
