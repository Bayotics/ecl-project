import type { Metadata } from "next";

import { CardGrid } from "@/components/page/CardGrid";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { albumCards } from "@/content/cards";
import { heroSlides } from "@/content/hero";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: pages.gallery.label, description: pages.gallery.description, path: pages.gallery.href });

const slide = heroSlides.find((item) => item.id === "community");

export default function GalleryPage() {
  return (
    <>
      <PageIntro label={pages.gallery.label} title={pages.gallery.title} lead={slide?.text} />
      <PageSection id="albums" title="Albums">
        <CardGrid items={albumCards()} />
      </PageSection>
    </>
  );
}
