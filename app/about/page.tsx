import type { Metadata } from "next";
import Link from "next/link";

import { ActionRow } from "@/components/page/ActionRow";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import styles from "@/components/page/page.module.css";
import { causeHref, causes } from "@/content/causes";
import { resolveMedia } from "@/content/media";
import { managedMedia } from "@/lib/supabase/adapters";
import { publicPageMedia } from "@/lib/supabase/content";
import { published } from "@/content/meta";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { intro, mission, whoWeServe } from "@/content/site";

export const metadata: Metadata = pageMetadata({ title: pages.about.label, description: pages.about.description, path: pages.about.href });

export const dynamic = "force-dynamic";
export default async function AboutPage() {
  const pageImages = await publicPageMedia("about");
  const hero = pageImages.find(item => item.placement === "about-hero");
  const heroMedia = hero ? resolveMedia(managedMedia(hero.image_url, hero.image_alt)) : undefined;
  return (
    <>
      <PageIntro label={pages.about.label} title={pages.about.title} lead={intro.body} media={heroMedia} />
      <PageSection id="mission" title={mission.label}>
        {mission.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </PageSection>
      <PageSection id="who-we-serve" title={whoWeServe.heading} tone="mist">
        <p>{whoWeServe.body}</p>
        <ActionRow actions={[{ label: "Become a member", href: "/join", primary: true }, { label: "Volunteer", href: "/volunteer" }]} />
      </PageSection>
      <PageSection id="areas" title="Areas of focus">
        <ul role="list" className={styles.list}>
          {published(causes).map((cause) => (
            <li key={cause.slug}>
              <Link href={causeHref(cause.slug)}>
                <span className={styles.listNumber}>{cause.number}</span>
                {cause.title}: {cause.short}
              </Link>
            </li>
          ))}
        </ul>
      </PageSection>
      <PageSection id="more" title="More about the club" tone="mist">
        <ul role="list" className={styles.list}>
          <li>
            <Link href={pages.history.href}>History</Link>
          </li>
          <li>
            <Link href={pages.leadership.href}>Leadership</Link>
          </li>
          <li>
            <Link href={pages.impact.href}>Our impact</Link>
          </li>
          <li>
            <Link href={pages.reports.href}>Reports</Link>
          </li>
          <li>
            <Link href={pages.gallery.href}>Gallery</Link>
          </li>
        </ul>
      </PageSection>
    </>
  );
}
