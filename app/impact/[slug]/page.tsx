import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { pageMetadata } from "@/lib/seo";

import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { ShareLinks } from "@/components/page/ShareLinks";
import styles from "@/components/page/page.module.css";
import { causeHref, getCause } from "@/content/causes";
import { feedHref, feedMeta, getStory, publishedStories } from "@/content/feed";
import { resolveMedia } from "@/content/media";
import { settings } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedStories().map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: PageProps<"/impact/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const story = getStory(slug);
  return story ? pageMetadata({ title: story.title, description: story.excerpt, path: feedHref(story), image: resolveMedia(story.media), type: "article" }) : {};
}

export default async function StoryPage({ params }: PageProps<"/impact/[slug]">) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();
  const cause = story.cause ? getCause(story.cause) : undefined;

  return (
    <article>
      <PageIntro label={feedMeta(story)} title={story.title} lead={story.excerpt} media={resolveMedia(story.media)} />
      <PageSection id="story" title={story.volunteerHighlight ? "Volunteer highlight" : "The story"}>
        <div className={styles.prose}>
          {story.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {cause ? (
            <p>
              Part of the club&apos;s work in <Link href={causeHref(cause.slug)}>{cause.title}</Link>.
            </p>
          ) : null}
        </div>
        <ShareLinks url={new URL(feedHref(story), settings.url).toString()} title={story.title} />
      </PageSection>
    </article>
  );
}
