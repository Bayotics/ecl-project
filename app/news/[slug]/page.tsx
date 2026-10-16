import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { pageMetadata } from "@/lib/seo";

import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { ShareLinks } from "@/components/page/ShareLinks";
import styles from "@/components/page/page.module.css";
import { feedHref, getNewsItem, publishedNews } from "@/content/feed";
import { resolveMedia } from "@/content/media";
import { formatPartialDate } from "@/content/meta";
import { settings } from "@/content/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedNews().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const item = getNewsItem(slug);
  return item ? pageMetadata({ title: item.title, description: item.excerpt, path: feedHref(item), image: resolveMedia(item.media), type: "article" }) : {};
}

export default async function NewsItemPage({ params }: PageProps<"/news/[slug]">) {
  const { slug } = await params;
  const item = getNewsItem(slug);
  if (!item?.date) notFound();

  return (
    <article>
      <PageIntro label={`News · ${formatPartialDate(item.date)}`} title={item.title} lead={item.excerpt} media={resolveMedia(item.media)} />
      <PageSection id="update" title="The update">
        <div className={styles.prose}>
          {item.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <ShareLinks url={new URL(feedHref(item), settings.url).toString()} title={item.title} />
        <Link href="/news" className={styles.action}>
          All news
        </Link>
      </PageSection>
    </article>
  );
}
