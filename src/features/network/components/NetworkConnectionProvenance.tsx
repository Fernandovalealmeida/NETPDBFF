"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

// The connection provenance affordance: reading stays calm; "why does the
// platform show these records as connected?" is one keyboard-operable gesture
// away. Provenance is NOT reduced to a decorative tooltip -- the full provenance
// (which canonical record the connection is projected from, its source, and its
// verification state) is carried by the trigger's ACCESSIBLE NAME (deterministic,
// server-rendered, unique per connection via the counterpart's label). The
// visual tooltip is an enhancement, not the only accessible source; disputed/
// provisional states additionally render as a visible Badge next to this
// trigger. Mirrors the Relationship/Participation/Timeline provenance pattern.
// Client Component: Radix Tooltip needs a provider ancestor, which this wraps.
export interface NetworkConnectionProvenanceProps {
  connectionLabel: string;
  sourceRecordLabel: string;
  sourceLabel: string;
  statusLabel: string;
}

export function NetworkConnectionProvenance({
  connectionLabel,
  sourceRecordLabel,
  sourceLabel,
  statusLabel,
}: NetworkConnectionProvenanceProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Provenance of the connection to ${connectionLabel}: projected from a ${sourceRecordLabel}. ${sourceLabel}. ${statusLabel}.`}
            className="inline-flex items-center gap-1 rounded-sm text-xs text-muted-foreground underline decoration-dotted underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Source
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span className="block text-muted-foreground">Projected from a {sourceRecordLabel}</span>
          <span className="block font-medium text-foreground">{sourceLabel}</span>
          <span className="block text-muted-foreground">{statusLabel}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
