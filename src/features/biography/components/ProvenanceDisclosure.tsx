"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

// A small, keyboard-operable provenance affordance: reading stays calm, and
// "how do we know this?" is one gesture away (docs/nodes-of-knowledge-design-bible-volume-1.md,
// "Honesty as design material"; Product Blueprint, "Provenance surface"). It
// is deliberately not an inline wall of metadata. Client Component: the
// Tooltip is Radix-backed and needs a TooltipProvider ancestor, which this
// wraps itself since the app has no root-level provider yet.
export interface ProvenanceDisclosureProps {
  sourceLabel: string;
  statusLabel: string;
  /** Short context for the accessible label, e.g. "identity" or "narrative". */
  subject: string;
}

export function ProvenanceDisclosure({ sourceLabel, statusLabel, subject }: ProvenanceDisclosureProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={`Provenance of the ${subject}: ${sourceLabel}. ${statusLabel}.`}
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
