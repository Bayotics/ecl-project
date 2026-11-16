import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { HistoryReader, ReadHistoryButton } from "@/components/history/HistoryReader";
import styles from "@/components/history/History.module.css";
import { Reveal } from "@/components/motion/Reveal";
import { ImageSlot } from "@/components/programs/ProgramSections";
import { ArrowRightIcon, PlayIcon } from "@/components/ui/icons";
import { historyExcerpt, historyPage, originalHistory } from "@/content/history";
import { resolveMedia } from "@/content/media";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: pages.history.label, description: pages.history.description, path: pages.history.href });

/** Archival tones for the gradient placeholders (read by ImageSlot). */
const theme = { "--p-deep": "#2b2015", "--p-accent": "#8c6a3c", "--p-pale": "#efe8d8", "--p-glow": "#d8b06a" } as CSSProperties;

/**
 * History: the club's own account of how Eko Club began. The page shows the first 500 characters and
 * draws its facts, timeline and sections from the account; "Read full history" opens the whole text.
 * These are the original Eko Club's dates; they are never presented as Eko Club Louisiana's founding.
 */
export default function HistoryPage() {
  const { breadcrumb, eyebrow, title, lead, facts, story, founder, film, timeline, quarters, bishopStreet, closing, readLabel } = historyPage;
  const excerpt = historyExcerpt(originalHistory.paragraphs, 500);
  const portrait = resolveMedia(founder.image);

  return (
    <div className={styles.page} style={theme}>
      {/* ── Opening ─────────────────────────────────────────────── */}
      <Reveal as="header" className={styles.intro}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb} data-reveal="fade">
          <ol role="list">
            {breadcrumb.map((crumb) => (
              <li key={crumb.href}>
                <Link href={crumb.href}>{crumb.label}</Link>
                <ArrowRightIcon size={10} />
              </li>
            ))}
            <li aria-current="page">History</li>
          </ol>
        </nav>
        <p className={styles.eyebrow} data-reveal="fade">
          {eyebrow}
        </p>
        <h1 className={styles.title}>
          {title.map((line) => (
            <span key={line} className={styles.titleLine} data-reveal="mask">
              {line}
            </span>
          ))}
        </h1>
        <p className={styles.lead} data-reveal>
          {lead}
        </p>
      </Reveal>

      <Reveal as="section" className={styles.facts} aria-label="Eko Club in numbers" stagger={0.1}>
        <dl className={styles.factGrid}>
          {facts.map((fact) => (
            <div key={fact.label} className={styles.fact} data-reveal data-reveal-y="32">
              <dt className={styles.factLabel}>{fact.label}</dt>
              <dd className={styles.factValue}>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Reveal>

      {/* ── The story: first 500 characters ─────────────────────── */}
      <Reveal as="section" className={styles.story} aria-labelledby="history-story">
        <div className={styles.storyMedia}>
          <div className={styles.storyMain} data-reveal="mask">
            <ImageSlot slot={story.image} sizes="(min-width: 1024px) 34vw, 100vw" variant={0} priority />
          </div>
          <figure className={styles.founder} data-reveal="scale">
            {/* A small supplied portrait, shown as the original file near its own size; the frame clips its black border. */}
            <div className={styles.founderPhoto}>
              <Image src={portrait.src} alt={portrait.alt} sizes="14rem" unoptimized />
            </div>
            <figcaption className={styles.founderCaption}>
              <span className={styles.founderName}>{founder.name}</span>
              <span className={styles.founderRole}>{founder.role}</span>
            </figcaption>
          </figure>
        </div>
        <div className={styles.storyCopy}>
          <p className={styles.label} data-reveal="fade">
            {story.label}
          </p>
          <h2 id="history-story" className={styles.heading} data-reveal>
            {story.heading}
          </h2>
          <div className={styles.excerpt} data-reveal>
            {excerpt.map((paragraph, index) => (
              <p key={index} className={index === 0 ? styles.excerptFirst : undefined}>
                {paragraph}
              </p>
            ))}
          </div>
          <div data-reveal="fade">
            <ReadHistoryButton label={readLabel} />
          </div>
        </div>
      </Reveal>

      {/* ── Film ────────────────────────────────────────────────── */}
      <Reveal as="section" className={styles.film} aria-labelledby="history-film">
        <div className={styles.filmHead}>
          <p className={styles.label} data-reveal="fade">
            {film.label}
          </p>
          <h2 id="history-film" className={styles.heading} data-reveal>
            {film.heading}
          </h2>
          <p className={styles.filmCaption} data-reveal="fade">
            {film.caption}
          </p>
          <p className={styles.filmDuration} data-reveal="fade">
            <PlayIcon size={12} />
            {film.duration}
          </p>
        </div>
        <div className={styles.filmFrame} data-reveal="mask">
          {film.sources.length ? (
            <video
              className={styles.filmVideo}
              controls
              playsInline
              preload="metadata"
              poster={film.poster ? resolveMedia(film.poster).src.src : undefined}
              aria-label={film.caption}
            >
              {film.sources.map((source) => (
                <source key={source.src} src={source.src} type={source.type} />
              ))}
            </video>
          ) : (
            <div className={styles.filmPlaceholder} role="img" aria-label={`Video placeholder: ${film.heading}`}>
              <span className={styles.filmPlay} aria-hidden="true">
                <PlayIcon size={22} />
              </span>
              <span className={styles.filmTag}>Video: {film.heading}</span>
            </div>
          )}
        </div>
      </Reveal>

      {/* ── Timeline ────────────────────────────────────────────── */}
      <Reveal as="section" className={styles.timeline} aria-labelledby="history-timeline" stagger={0.12}>
        <div className={styles.sectionHead}>
          <p className={styles.label} data-reveal="fade">
            {timeline.label}
          </p>
          <h2 id="history-timeline" className={styles.heading} data-reveal>
            {timeline.heading}
          </h2>
        </div>
        <ol className={styles.timelineList}>
          {timeline.items.map((item) => (
            <li key={item.when} className={styles.timelineItem} data-reveal="left">
              <p className={styles.timelineWhen}>{item.when}</p>
              <span className={styles.timelineDot} aria-hidden="true" />
              <div>
                <h3 className={styles.timelineTitle}>{item.title}</h3>
                <p className={styles.body}>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* ── Lagos Island, quarter by quarter ────────────────────── */}
      <Reveal as="section" className={styles.quarters} aria-labelledby="history-quarters">
        <div className={styles.quartersHead}>
          <div>
            <p className={styles.label} data-reveal="fade">
              {quarters.label}
            </p>
            <h2 id="history-quarters" className={styles.heading} data-reveal>
              {quarters.heading}
            </h2>
          </div>
          <p className={styles.body} data-reveal="fade">
            {quarters.text}
          </p>
        </div>
        <div className={styles.marquee} data-reveal="fade">
          {[0, 1].map((row) => (
            <div key={row} className={styles.marqueeRow} data-direction={row === 1 ? "reverse" : undefined}>
              {[0, 1].map((copy) => (
                <ul key={copy} className={styles.marqueeTrack} role="list" aria-hidden={copy === 1 || row === 1 || undefined}>
                  {(row === 0 ? quarters.names : [...quarters.names].reverse()).map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              ))}
            </div>
          ))}
        </div>
        <div className={styles.cultureGrid}>
          <div className={styles.cultureMedia} data-reveal="mask-left">
            <ImageSlot slot={quarters.image} sizes="(min-width: 1024px) 45vw, 100vw" variant={2} />
          </div>
          <div className={styles.cultureLists}>
            {quarters.culture.map((group) => (
              <div key={group.title} className={styles.cultureGroup} data-reveal="right">
                <h3 className={styles.cultureTitle}>{group.title}</h3>
                <ul role="list" className={styles.cultureItems}>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── 10 Bishop Street ────────────────────────────────────── */}
      <Reveal as="section" className={styles.bishop} aria-labelledby="history-bishop">
        <div className={styles.bishopCopy}>
          <p className={styles.label} data-reveal="fade">
            {bishopStreet.label}
          </p>
          <h2 id="history-bishop" className={styles.bishopHeading} data-reveal="mask">
            {bishopStreet.heading}
          </h2>
          <blockquote className={styles.bishopQuote} data-reveal>
            “{bishopStreet.quote}”
          </blockquote>
          <p className={styles.body} data-reveal="fade">
            {bishopStreet.text}
          </p>
        </div>
        <div className={styles.bishopMedia} data-reveal="right">
          <ImageSlot slot={bishopStreet.image} sizes="(min-width: 1024px) 50vw, 100vw" variant={3} />
        </div>
      </Reveal>

      {/* ── Closing ─────────────────────────────────────────────── */}
      <Reveal as="section" className={styles.closing} aria-label="Our heritage">
        <span className={styles.closingMark} aria-hidden="true" data-reveal="scale">
          “
        </span>
        <p className={styles.closingText} data-reveal="mask">
          {closing.text}
        </p>
        <p className={styles.closingNote} data-reveal="fade">
          {closing.note}
        </p>
        <div data-reveal="fade">
          <ReadHistoryButton label={readLabel} tone="light" />
        </div>
      </Reveal>

      <HistoryReader title={originalHistory.heading} eyebrow={eyebrow} paragraphs={originalHistory.paragraphs} />
    </div>
  );
}
