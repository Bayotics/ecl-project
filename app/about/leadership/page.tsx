import type { Metadata } from "next";
import { ActionRow } from "@/components/page/ActionRow";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import styles from "@/components/page/page.module.css";
import { MediaImage } from "@/components/ui/MediaImage";
import { publicExecutives } from "@/lib/supabase/content";
import portraitStyles from "./leadership.module.css";
import { resolveMedia } from "@/content/media";
import { published } from "@/content/meta";
import type { Leader } from "@/content/types";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Executives", description: "Meet Eko Club Louisiana's 2025–2028 executives and presidents since inception.", path: "/about/leadership" });

function Portraits({ people }: { people: Leader[] }) {
  return <ul role="list" className={styles.people}>{published(people).map(person =>
    <li key={person.slug} className={`${styles.person} ${portraitStyles.person}`}>
      {person.media && <div className={`${styles.portrait} ${portraitStyles.portrait}`}><MediaImage media={resolveMedia(person.media)} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 92vw" /></div>}
      <p className={styles.personRole}>{person.role}</p>
      <h3 className={styles.personName}>{person.name}</h3>
      <p>{person.term}</p>
      {person.bio && <p className={styles.personBio}>{person.bio}</p>}
    </li>
  )}</ul>;
}

export const dynamic = "force-dynamic";
export default async function LeadershipPage() {
  const people = await publicExecutives();
  const leadership = people.filter(p => p.section === "current");
  const past = people.filter(p => p.section === "past");
  const presidents = people.filter(p => p.section === "presidents");
  return <>
    <PageIntro label="Executives" title="Our club leadership" />
    <PageSection id="current-executives" title="Current executives">
      {leadership.length ? <Portraits people={leadership} /> : <p>Current executives will be listed here once published.</p>}
    </PageSection>
    {past.length > 0 && <PageSection id="past-executives" title="Past executives"><Portraits people={past} /></PageSection>}
    <PageSection id="presidents" title="Presidents since inception" tone="mist">
      <Portraits people={presidents} />
    </PageSection>
    <PageSection id="transparency" title="Transparency">
      <p>Governance, financial and impact documents are published on the reports page as the club approves them.</p>
      <ActionRow actions={[{ label: "Reports", href: "/reports", primary: true }, { label: "Contact the club", href: "/contact" }]} />
    </PageSection>
  </>;
}
