import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { Section } from "@/components/ui/Section";
import { pageTitle } from "@/config/site";
import { BiographyNarrative } from "@/features/biography/components/BiographyNarrative";
import { BiographySection } from "@/features/biography/components/BiographySection";
import { IdentityHeader } from "@/features/biography/components/IdentityHeader";
import { biographyCopy, RESERVED_SECTION_ORDER } from "@/features/biography/copy";
import { getPersonBiography } from "@/features/biography/read";
import { Timeline } from "@/features/timeline/components/Timeline";
import { getPersonTimeline } from "@/features/timeline/read";

// The Scientific Biography read route -- the first production surface of the
// Digital Scientific Biography. Protected (authenticated authorized reading);
// the (protected) layout enforces auth and public.get_person_biography
// re-checks it. Keyed by the person-entity UUID and named generically
// (/people/[personId]) -- Node-neutral, no PDBFF-specific route, no public
// route yet (deferred with the public-record policy, M6.V/G1). The title is
// intentionally generic (no personal name in <title>/history).
//
// Reading order (Blueprint's Biography Engine): identity band, then the
// introductory narrative (or honest absence), then the reserved section
// architecture for later engines, then the honest withheld-note. Server
// Component; the read happens server-side.
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

  return (
    <main id="main-content" tabIndex={-1} className="py-16">
      <Container width="content">
        <IdentityHeader document={document} />

        <Section spacing="sm" className="mt-8" aria-label="Biographical narrative">
          <BiographyNarrative document={document} />
        </Section>

        <Divider />

        <div className="mt-10">
          <Timeline document={timeline} />
        </div>

        <div className="mt-10 flex flex-col gap-8">
          {RESERVED_SECTION_ORDER.map((key) => {
            const section = biographyCopy.reservedSections[key];
            return (
              <BiographySection key={key} id={key} title={section.title} description={section.description} />
            );
          })}
        </div>

        <p className="mt-10 text-xs text-muted-foreground">{biographyCopy.withheldNote}</p>
      </Container>
    </main>
  );
}
