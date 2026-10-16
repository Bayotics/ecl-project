import type { Metadata } from "next";

import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { Pending } from "@/components/page/Pending";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { culture } from "@/content/site";

export const metadata: Metadata = pageMetadata({ title: pages.culture.label, description: pages.culture.description, path: pages.culture.href });

export default function CulturePage() {
  return (
    <>
      <PageIntro label={pages.culture.label} title={pages.culture.title} lead={culture.body} media={culture.poster} />
      <PageSection id="traditions" title="Traditions we keep">
        <Pending topic="the club's cultural activities" />
      </PageSection>
    </>
  );
}
