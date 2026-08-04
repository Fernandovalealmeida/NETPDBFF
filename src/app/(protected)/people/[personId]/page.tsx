import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { ReadingSpine } from "@/components/ui/ReadingSpine";
import { pageTitle } from "@/config/site";
import { BiographyNarrative } from "@/features/biography/components/BiographyNarrative";
import { BiographySection } from "@/features/biography/components/BiographySection";
import { IdentityHeader } from "@/features/biography/components/IdentityHeader";
import { biographyCopy, RESERVED_SECTION_ORDER } from "@/features/biography/copy";
import { getPersonBiography } from "@/features/biography/read";
import { PersonContributions } from "@/features/contribution/components/PersonContributions";
import { getPersonContributions } from "@/features/contribution/read";
import { Participation } from "@/features/participation/components/Participation";
import { getPersonParticipation } from "@/features/participation/read";
import { Relationships } from "@/features/relationships/components/Relationships";
import { getPersonRelationships } from "@/features/relationships/read";
import { Timeline } from "@/features/timeline/components/Timeline";
import { getPersonTimeline } from "@/features/timeline/read";

// The Scientific Biography read route -- the first production surface of the
// Digital Scientific Biography. Protected (authenticated authorized reading);
// the (protected) layout enforces auth and public.get_person_biography
// re-checks it. Keyed by the person-entity UUID and named generically
// (/people/[personId]) -- Node-neutral, no PDBFF-specific route. The title is
// intentionally generic (no personal name in <title>/history).
//
// Reading order (Blueprint's Biography Engine): identity band, a divider, then
// the reading spine -- the introductory narrative (or honest absence), the
// historical engines (timeline, participation, relationships, contributions),
// the reserved section architecture, and the honest withheld-note. The spine is
// composed through <ReadingSpine>, the SAME primitive the Institution and
// Contribution pages use, so the three canonical pages share one continuous
// rhythm and a reader never feels they have crossed from one software module
// into another (Production Experience Phase I). The sections are NOT flattened:
// each engine keeps its own narrative/chronology/belonging/assertion semantics.
// These engines ARE this person's documented connections: the timeline projects
// their events, participation their institutions, relationships their people,
// contributions their contributions -- each a doorway onward. The M7 Knowledge
// Network is the invisible infrastructure behind those links (ADR-0017); there
// is no "enter the network" step. Server Component; reads composed server-side.
export const metadata: Metadata = {
  title: pageTitle("Scientific biography"),
};

interface BiographyPageProps {
  params: Promise<{ personId: string }>;
}

export default async function BiographyPage({ params }: BiographyPageProps) {
  const { personId } = await params;
  const document = await getPersonBiography(personId);

  if (!document) {
    notFound();
  }

  const timeline = await getPersonTimeline(personId);
  const participation = await getPersonParticipation(personId);
  const relationships = await getPersonRelationships(personId);
  const contributions = await getPersonContributions(personId);

  return (
    <main id="main-content" tabIndex={-1} className="py-16">
      <Container width="content">
        <IdentityHeader document={document} />

        <Divider />

        <ReadingSpine>
          <section aria-label="Biographical narrative">
            <BiographyNarrative document={document} />
          </section>

          <Timeline document={timeline} />

          <Participation document={participation} />

          <Relationships document={relationships} />

          <PersonContributions document={contributions} />

          <div className="flex flex-col gap-8">
            {RESERVED_SECTION_ORDER.map((key) => {
              const section = biographyCopy.reservedSections[key];
              return (
                <BiographySection key={key} id={key} title={section.title} description={section.description} />
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">{biographyCopy.withheldNote}</p>
        </ReadingSpine>
      </Container>
    </main>
  );
}
