"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

// The event provenance affordance: reading stays calm; "how do we know this?"
// is one keyboard-operable gesture away, never an inline metadata wall
// (Product Blueprint, "Provenance surface"). Client Component: Radix Tooltip
// needs a provider ancestor, which this wraps itself.
export interface EventProvenanceProps {
  sourceLabel: string;
  statusLabel: string;
}

export function EventProvenance({ sourceLabel, statusLabel }: EventProvenanceProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Provenance of this event: ${sourceLabel}. ${statusLabel}.`}
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
