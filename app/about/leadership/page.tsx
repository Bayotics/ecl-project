import type { Metadata } from "next";

import { ActionRow } from "@/components/page/ActionRow";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import styles from "@/components/page/page.module.css";
import { MediaImage } from "@/components/ui/MediaImage";
import { leadership } from "@/content/leadership";
import { resolveMedia } from "@/content/media";
import { published } from "@/content/meta";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: pages.leadership.label, description: pages.leadership.description, path: pages.leadership.href });

/** Approved officers only: names, roles, photographs and bios supplied by the club. */
export default function LeadershipPage() {
  const leaders = published(leadership);

  return (
    <>
      <PageIntro label={pages.leadership.label} title={pages.leadership.title} />
      <PageSection id="officers" title="Officers">
        {leaders.length ? (
          <ul role="list" className={styles.people}>
            {leaders.map((leader) => (
              <li key={leader.slug} className={styles.person}>
                {leader.media ? (
                  <div className={styles.portrait}>
                    <MediaImage media={resolveMedia(leader.media)} sizes="(min-width: 1024px) 20vw, (min-width: 768px) 30vw, 92vw" />
                  </div>
                ) : null}
                <p className={styles.personRole}>
                  {leader.role}
                  {leader.term ? ` · ${leader.term}` : ""}
                </p>
                <h3 className={styles.personName}>{leader.name}</h3>
                {leader.bio ? <p className={styles.personBio}>{leader.bio}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.notice}>
            The club&apos;s current officers will be listed here, with their roles and terms, once the club confirms them for
            publication.
          </p>
        )}
      </PageSection>
      <PageSection id="transparency" title="Transparency" tone="mist">
        <p>Governance, financial and impact documents are published on the reports page as the club approves them.</p>
        <ActionRow actions={[{ label: "Reports", href: "/reports", primary: true }, { label: "Contact the club", href: "/contact" }]} />
      </PageSection>
    </>
  );
}
