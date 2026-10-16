import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { pageMetadata } from "@/lib/seo";

import { ActionRow } from "@/components/page/ActionRow";
import { CardGrid } from "@/components/page/CardGrid";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import styles from "@/components/page/page.module.css";
import { storyCards } from "@/content/cards";
import { causeHref, causes, getCause } from "@/content/causes";
import { resolveMedia } from "@/content/media";
import { published } from "@/content/meta";

export const dynamicParams = false;

export function generateStaticParams() {
  return published(causes).map((cause) => ({ slug: cause.slug }));
}

export async function generateMetadata({ params }: PageProps<"/programs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cause = getCause(slug);
  return cause ? pageMetadata({ title: cause.title, description: `${cause.title}: ${cause.short}.`, path: causeHref(cause.slug), image: resolveMedia(cause.media) }) : {};
}

export default async function ProgramPage({ params }: PageProps<"/programs/[slug]">) {
  const { slug } = await params;
  const cause = getCause(slug);
  if (!cause || cause.status !== "published") notFound();

  const related = storyCards((story) => story.cause === cause.slug);
  const others = published(causes).filter((item) => item.slug !== cause.slug);

  return (
    <>
      <PageIntro label={`Program ${cause.number}`} title={cause.title} lead={cause.short} media={resolveMedia(cause.media)} />
      <PageSection id="about-area" title="About this area">
        {cause.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </PageSection>
      {/* Related stories appear only when the club has published real ones for this area. */}
      {related.length ? (
        <PageSection id="stories" title="Stories" tone="mist">
          <CardGrid items={related} />
        </PageSection>
      ) : null}
      <PageSection id="take-part" title="Take part" tone={related.length ? "paper" : "mist"}>
        <p>Support {cause.title.toLowerCase()} with your time, your membership or a gift.</p>
        <ActionRow
          actions={[
            { label: "Volunteer", href: `/volunteer?interest=${cause.slug}`, primary: true },
            { label: "Become a member", href: "/join" },
            { label: "Donate", href: "/donate" },
            { label: "Events", href: "/events" },
          ]}
        />
      </PageSection>
      <PageSection id="other-areas" title="Other areas">
        <ul role="list" className={styles.list}>
          {others.map((item) => (
            <li key={item.slug}>
              <Link href={causeHref(item.slug)}>
                <span className={styles.listNumber}>{item.number}</span>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </PageSection>
    </>
  );
}
