import type { Metadata } from "next";

import { ActionRow } from "@/components/page/ActionRow";
import { CardGrid } from "@/components/page/CardGrid";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import styles from "@/components/page/page.module.css";
import { newsCards } from "@/content/cards";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: pages.news.label, description: pages.news.description, path: pages.news.href });

/** Dated club updates only. Events live at /events; stories at /impact. */
export default function NewsPage() {
  const items = newsCards();

  return (
    <>
      <PageIntro label={pages.news.label} title={pages.news.title} />
      <PageSection id="latest" title="Latest updates">
        {items.length ? (
          <CardGrid items={items} />
        ) : (
          <p className={styles.notice}>
            No club updates have been published yet. Updates appear here, with their dates, as the club publishes them.
          </p>
        )}
      </PageSection>
      <PageSection id="more" title="Also from the club" tone="mist">
        <p>See upcoming and past events, or sign up to receive updates by email.</p>
        <ActionRow
          actions={[
            { label: "Events", href: "/events", primary: true },
            { label: "Event archive", href: "/events?when=past" },
            { label: "Newsletter", href: "/contact#newsletter" },
          ]}
        />
      </PageSection>
    </>
  );
}
