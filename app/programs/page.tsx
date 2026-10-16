import type { Metadata } from "next";

import { CardGrid } from "@/components/page/CardGrid";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { causeCards } from "@/content/cards";
import { resolveMedia } from "@/content/media";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: pages.programs.label, description: pages.programs.description, path: pages.programs.href });

export default function ProgramsPage() {
  return (
    <>
      <PageIntro
        label={pages.programs.label}
        title={pages.programs.title}
        lead={pages.programs.lead}
        media={resolveMedia({ asset: "communityDance" })}
      />
      <PageSection id="areas" title="Areas of focus">
        <CardGrid items={causeCards()} />
      </PageSection>
    </>
  );
}
