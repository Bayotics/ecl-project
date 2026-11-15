import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { pageMetadata } from "@/lib/seo";

import { CardGrid } from "@/components/page/CardGrid";
import { PageSection } from "@/components/page/PageSection";
import { OtherPrograms, ProgramCta, ProgramHero, ProgramSectionView, ProgramTheme } from "@/components/programs/ProgramSections";
import { storyCards } from "@/content/cards";
import { causeHref, causes, getCause } from "@/content/causes";
import { resolveMedia } from "@/content/media";
import { published } from "@/content/meta";
import { programPage } from "@/content/programs";

export const dynamicParams = false;

export function generateStaticParams() {
  return published(causes).map((cause) => ({ slug: cause.slug }));
}

export async function generateMetadata({ params }: PageProps<"/programs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cause = getCause(slug);
  return cause ? pageMetadata({ title: cause.title, description: `${cause.title}: ${cause.short}.`, path: causeHref(cause.slug), image: resolveMedia(cause.media) }) : {};
}

/**
 * Program (mission area) page: a themed opening, the area's own sequence of sections
 * (content/programs.ts), published stories when there are any, a call to action and the other areas.
 */
export default async function ProgramPage({ params }: PageProps<"/programs/[slug]">) {
  const { slug } = await params;
  const cause = getCause(slug);
  const page = programPage(slug);
  if (!cause || cause.status !== "published" || !page) notFound();

  // Related stories appear only when the club has published real ones for this area.
  const related = storyCards((story) => story.cause === cause.slug);
  const others = published(causes)
    .filter((item) => item.slug !== cause.slug)
    .map((item) => ({ slug: item.slug, number: item.number, title: item.title, href: causeHref(item.slug) }));

  return (
    <ProgramTheme page={page}>
      <ProgramHero hero={page.hero} />
      {page.sections.map((section, index) => (
        <ProgramSectionView key={`${section.kind}-${index}`} section={section} index={index} />
      ))}
      {related.length ? (
        <PageSection id="stories" title="Stories" tone="mist">
          <CardGrid items={related} />
        </PageSection>
      ) : null}
      <ProgramCta cta={page.cta} />
      <OtherPrograms items={others} />
    </ProgramTheme>
  );
}
