import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { TiltCard } from "@/components/executives/TiltCard";
import styles from "@/components/executives/Executives.module.css";
import { Reveal } from "@/components/motion/Reveal";
import { ActionRow } from "@/components/page/ActionRow";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediaImage } from "@/components/ui/MediaImage";
import { resolveMedia } from "@/content/media";
import { published } from "@/content/meta";
import type { Leader } from "@/content/types";
import { publicExecutives } from "@/lib/db/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Executives", description: "Meet Eko Club Louisiana's 2025–2028 executives and presidents since inception.", path: "/about/leadership" });

/** Royal blue and stole gold. */
const theme = { "--x-deep": "#111a2e", "--x-deep-2": "#1a2643", "--x-gold": "#b8924a", "--x-glow": "#dcb873", "--x-pale": "#ece6d6" } as CSSProperties;

/** Portraits fill their frame, kept on the face (admin uploads are otherwise shown whole on a light panel). */
function Portrait({ person, sizes, priority }: { person: Leader; sizes: string; priority?: boolean }) {
  if (!person.media) return <div className={styles.portraitEmpty} aria-hidden="true" />;
  const media = { ...resolveMedia(person.media), fit: "cover" as const, position: "50% 18%" };
  return <MediaImage media={{ ...media, alt: person.name }} sizes={sizes} preload={priority} unoptimized />;
}

/** "2016–2020" → 2016, so presidents run in order whatever order they were entered in. */
const startYear = (term: string | null) => Number(term?.match(/\d{4}/)?.[0] ?? 9999);
const pad = (n: number) => String(n).padStart(2, "0");

function Council({ people, offset }: { people: Leader[]; offset: number }) {
  return (
    <Reveal as="ol" className={styles.council} stagger={0.1}>
      {people.map((person, index) => (
        <li key={person.slug} className={styles.member} data-reveal data-reveal-y="48">
          <TiltCard className={styles.memberCard}>
            <div className={styles.memberPhoto}>
              <Portrait person={person} sizes="(min-width: 1024px) 24vw, 46vw" />
              <span className={styles.memberIndex} aria-hidden="true">
                {pad(index + offset)}
              </span>
            </div>
          </TiltCard>
          <p className={styles.memberRole}>{person.role}</p>
          <h3 className={styles.memberName}>{person.name}</h3>
          <p className={styles.memberTerm}>{person.term}</p>
          {person.bio && <p className={styles.memberBio}>{person.bio}</p>}
        </li>
      ))}
    </Reveal>
  );
}

// Cached and served instantly; refreshed hourly and immediately whenever the admin saves a change.
export const revalidate = 3600;
export default async function LeadershipPage() {
  const people = published(await publicExecutives());
  const current = people.filter((p) => p.section === "current");
  const past = people.filter((p) => p.section === "past");
  const presidents = people.filter((p) => p.section === "presidents").sort((a, b) => startYear(a.term) - startYear(b.term));

  const lead = current.find((p) => /^president$/i.test(p.role.trim())) ?? current[0];
  const council = current.filter((p) => p !== lead);
  const facts = [
    { value: String(current.length), label: "Executive officers" },
    ...(lead?.term ? [{ value: lead.term, label: "Current term" }] : []),
    { value: String(presidents.length), label: "Presidents since inception" },
  ];

  return (
    <div className={styles.page} style={theme}>
      {/* ── Opening: the president ─────────────────────────────── */}
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <ol role="list">
              <li>
                <Link href="/">Home</Link>
                <ArrowRightIcon size={10} />
              </li>
              <li>
                <Link href="/about">About us</Link>
                <ArrowRightIcon size={10} />
              </li>
              <li aria-current="page">Executives</li>
            </ol>
          </nav>
          <p className={styles.eyebrow}>Executives{lead ? ` · ${lead.term}` : ""}</p>
          <h1 className={styles.title}>
            <span className={styles.titleLine}>
              <span>Our club</span>
            </span>
            <span className={styles.titleLine}>
              <span>leadership</span>
            </span>
          </h1>
          <p className={styles.lead}>The officers elected to serve Eko Club Louisiana, and the presidents who have led the club since inception.</p>
        </div>

        {lead && (
          <figure className={styles.president}>
            <div className={styles.presidentFrame}>
              <div className={styles.presidentPhoto}>
                <Portrait person={lead} sizes="(min-width: 1024px) 32vw, 80vw" priority />
              </div>
            </div>
            <figcaption className={styles.presidentCaption}>
              <span className={styles.presidentRole}>{lead.role}</span>
              <span className={styles.presidentName}>{lead.name}</span>
              <span className={styles.presidentTerm}>{lead.term}</span>
            </figcaption>
          </figure>
        )}

        <dl className={styles.facts}>
          {facts.map((fact) => (
            <div key={fact.label} className={styles.fact}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      {/* ── The executive council ──────────────────────────────── */}
      <section className={styles.section} aria-labelledby="current-executives">
        <Reveal className={styles.sectionHead}>
          <p className={styles.label} data-reveal="fade">
            {lead ? lead.term : "Current"}
          </p>
          <h2 id="current-executives" className={styles.heading} data-reveal>
            The executive council
          </h2>
          <p className={styles.body} data-reveal="fade">
            Serving alongside the President{lead ? `, ${lead.name},` : ""} for the current term.
          </p>
        </Reveal>
        {current.length ? <Council people={council.length ? council : current} offset={council.length ? 2 : 1} /> : <p className={styles.body}>Current executives will be listed here once published.</p>}
      </section>

      {past.length > 0 && (
        <section className={styles.section} aria-labelledby="past-executives">
          <Reveal className={styles.sectionHead}>
            <p className={styles.label} data-reveal="fade">
              Past terms
            </p>
            <h2 id="past-executives" className={styles.heading} data-reveal>
              Past executives
            </h2>
          </Reveal>
          <Council people={past} offset={1} />
        </section>
      )}

      {/* ── Presidents, in order ───────────────────────────────── */}
      {presidents.length > 0 && (
        <section className={styles.succession} aria-labelledby="presidents">
          <Reveal className={styles.sectionHead}>
            <p className={styles.label} data-reveal="fade">
              Since inception
            </p>
            <h2 id="presidents" className={styles.heading} data-reveal>
              Presidents of Eko Club Louisiana
            </h2>
          </Reveal>
          <Reveal className={styles.timeline} stagger={0.16}>
            <span className={styles.timelineLine} aria-hidden="true" data-reveal="mask-left" />
            <ol role="list" className={styles.terms}>
            {presidents.map((person, index) => {
              const serving = /present/i.test(person.term ?? "");
              return (
                <li key={person.slug} className={styles.term} data-reveal data-reveal-y="40">
                  <span className={styles.termDot} data-serving={serving || undefined} aria-hidden="true" />
                  <p className={styles.termYears}>{serving ? `Since ${startYear(person.term)}` : person.term}</p>
                  <div className={styles.termPhoto}>
                    <Portrait person={person} sizes="(min-width: 1024px) 18vw, 40vw" />
                  </div>
                  <p className={styles.termOrder}>
                    {pad(index + 1)} · {serving ? "In office" : person.role}
                  </p>
                  <h3 className={styles.termName}>{person.name}</h3>
                </li>
              );
            })}
            </ol>
          </Reveal>
        </section>
      )}

      {/* ── Transparency ───────────────────────────────────────── */}
      <Reveal as="section" className={styles.closing} aria-labelledby="transparency">
        <h2 id="transparency" className={styles.closingHeading} data-reveal="mask">
          Accountable to our members
        </h2>
        <div data-reveal="fade">
          <p className={styles.body}>Governance and financial reports are published on the reports page as the club approves them.</p>
          <ActionRow actions={[{ label: "Reports", href: "/reports", primary: true }, { label: "Contact the club", href: "/contact" }]} />
        </div>
      </Reveal>
    </div>
  );
}
