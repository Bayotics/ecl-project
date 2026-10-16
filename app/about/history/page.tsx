import type { Metadata } from "next";

import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import styles from "@/components/page/page.module.css";
import { chapterHistory, originalHistory } from "@/content/history";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { editorial } from "@/content/site";

export const metadata: Metadata = pageMetadata({ title: pages.history.label, description: pages.history.description, path: pages.history.href });

/**
 * Two separate accounts: the original Eko Club, and Eko Club Louisiana. The original club's 1974/1975
 * dates are never presented as the Louisiana chapter's founding.
 */
export default function HistoryPage() {
  return (
    <>
      <PageIntro label={pages.history.label} title={pages.history.title} lead={pages.history.lead} media={editorial.media} />
      {originalHistory.status === "published" ? (
        <PageSection id={originalHistory.id} title={originalHistory.heading}>
          <div className={styles.prose}>
            {originalHistory.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </PageSection>
      ) : null}
      <PageSection id={chapterHistory.id} title={chapterHistory.heading} tone="mist">
        {chapterHistory.status === "published" && chapterHistory.paragraphs.length ? (
          <div className={styles.prose}>
            {chapterHistory.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : (
          <p className={styles.notice}>
            The history of Eko Club Louisiana is being written with the club&apos;s members and will be published here once it
            is approved.
          </p>
        )}
      </PageSection>
    </>
  );
}
