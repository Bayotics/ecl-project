import Link from "next/link";
import type { CSSProperties } from "react";

import type { ImageSlot as Slot, ProgramPage, ProgramSection } from "@/content/programs";
import { resolveMedia } from "@/content/media";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediaImage } from "@/components/ui/MediaImage";
import { cx } from "@/lib/cx";

import styles from "./ProgramSections.module.css";

/** Photograph when one is set; otherwise a themed gradient that names the picture it is waiting for. */
export function ImageSlot({ slot, variant = 0, sizes, className, priority }: { slot: Slot; variant?: number; sizes: string; className?: string; priority?: boolean }) {
  if (slot.image) {
    return (
      <div className={cx(styles.slot, className)}>
        {/* Shown exactly as supplied: the original file, never resized or re-encoded. */}
        <MediaImage media={{ ...resolveMedia(slot.image), alt: slot.label }} sizes={sizes} preload={priority} unoptimized />
      </div>
    );
  }
  return (
    <div className={cx(styles.slot, styles.placeholder, className)} data-variant={variant % 4} role="img" aria-label={`Image placeholder: ${slot.label}`}>
      <span className={styles.slotLabel}>{slot.label}</span>
    </div>
  );
}

const themeVars = (theme: ProgramPage["theme"]) =>
  ({ "--p-deep": theme.deep, "--p-accent": theme.accent, "--p-pale": theme.pale, "--p-glow": theme.glow }) as CSSProperties;

export function ProgramTheme({ page, children }: { page: ProgramPage; children: React.ReactNode }) {
  return (
    <div className={styles.program} style={themeVars(page.theme)}>
      {children}
    </div>
  );
}

/* ── Opening ─────────────────────────────────────────────────────── */

export function ProgramHero({ hero }: { hero: ProgramPage["hero"] }) {
  const copy = (
    <>
      <p className={styles.eyebrow} data-reveal="fade">
        {hero.eyebrow}
      </p>
      <h1 className={styles.heroTitle} data-reveal>
        {hero.title}
      </h1>
      <p className={styles.heroLead} data-reveal>
        {hero.lead}
      </p>
    </>
  );

  if (hero.variant === "full") {
    return (
      <Reveal as="header" className={cx(styles.hero, styles.heroFull)}>
        <div className={styles.heroFullMedia} data-reveal="fade">
          <ImageSlot slot={hero.image} sizes="100vw" priority variant={1} />
        </div>
        <div className={styles.heroFullCopy}>{copy}</div>
      </Reveal>
    );
  }
  if (hero.variant === "centered") {
    return (
      <Reveal as="header" className={cx(styles.hero, styles.heroCentered)}>
        <div className={styles.heroCenteredCopy}>{copy}</div>
        <div className={styles.heroStrip} data-reveal="mask">
          <ImageSlot slot={hero.image} sizes="100vw" priority variant={2} />
        </div>
      </Reveal>
    );
  }
  return (
    <Reveal as="header" className={cx(styles.hero, styles.heroSplit)}>
      <div className={styles.heroSplitCopy}>{copy}</div>
      <div className={styles.heroSplitMedia} data-reveal="mask">
        <ImageSlot slot={hero.image} sizes="(min-width: 1024px) 50vw, 100vw" priority variant={0} />
      </div>
    </Reveal>
  );
}

/* ── Sections ────────────────────────────────────────────────────── */

export function ProgramSectionView({ section, index }: { section: ProgramSection; index: number }) {
  switch (section.kind) {
    case "statement":
      return (
        <Reveal as="section" className={cx(styles.statement, styles[`tone-${section.tone}`])} aria-label={section.label}>
          <p className={styles.label} data-reveal="fade">
            {section.label}
          </p>
          <p className={styles.statementText} data-reveal="mask">
            {section.text}
          </p>
        </Reveal>
      );

    case "split":
      return (
        <Reveal as="section" className={cx(styles.split, styles[`tone-${section.tone}`], section.side === "right" && styles.splitReverse)}>
          <div className={styles.splitMedia} data-reveal={section.side === "left" ? "mask-left" : "mask"}>
            <ImageSlot slot={section.image} sizes="(min-width: 1024px) 45vw, 100vw" variant={index} />
          </div>
          <div className={styles.splitCopy} data-reveal={section.side === "left" ? "right" : "left"}>
            <p className={styles.label}>{section.label}</p>
            <h2 className={styles.heading}>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className={styles.body}>
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      );

    case "pillars":
      return (
        <Reveal as="section" className={cx(styles.pillars, styles[`tone-${section.tone}`])} stagger={0.12}>
          <div className={styles.sectionHead}>
            <p className={styles.label} data-reveal="fade">
              {section.label}
            </p>
            <h2 className={styles.heading} data-reveal>
              {section.heading}
            </h2>
          </div>
          <ol className={styles.pillarGrid} data-count={section.items.length}>
            {section.items.map((item, i) => (
              <li key={item.title} className={styles.pillar} data-reveal data-reveal-y="40">
                <span className={styles.pillarNumber}>{String(i + 1).padStart(2, "0")}</span>
                <h3 className={styles.pillarTitle}>{item.title}</h3>
                <p className={styles.body}>{item.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      );

    case "steps":
      return (
        <Reveal as="section" className={styles.steps} stagger={0.14}>
          <div className={styles.sectionHead}>
            <p className={styles.label} data-reveal="fade">
              {section.label}
            </p>
            <h2 className={styles.heading} data-reveal>
              {section.heading}
            </h2>
          </div>
          <ol className={styles.stepList}>
            {section.steps.map((step, i) => (
              <li key={step.title} className={styles.step} data-reveal="left">
                <span className={styles.stepDot} aria-hidden="true">
                  {i + 1}
                </span>
                <h3 className={styles.stepTitle}>
                  {step.href ? (
                    <Link href={step.href} className={styles.stepLink}>
                      {step.title}
                      <ArrowRightIcon size={14} />
                    </Link>
                  ) : (
                    step.title
                  )}
                </h3>
                <p className={styles.body}>{step.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      );

    case "mosaic":
      return (
        <Reveal as="section" className={styles.mosaic} stagger={0.08}>
          <div className={styles.mosaicHead}>
            <div>
              <p className={styles.label} data-reveal="fade">
                {section.label}
              </p>
              <h2 className={styles.heading} data-reveal>
                {section.heading}
              </h2>
            </div>
            <p className={styles.body} data-reveal="fade">
              {section.text}
            </p>
          </div>
          <ul className={styles.mosaicGrid} data-count={section.slots.length} role="list">
            {section.slots.map((slot, i) => (
              <li key={slot.label} className={styles.mosaicItem} data-reveal="scale">
                <ImageSlot slot={slot} sizes="(min-width: 1024px) 33vw, 50vw" variant={i + index} />
              </li>
            ))}
          </ul>
        </Reveal>
      );

    case "quote":
      return (
        <Reveal as="section" className={styles.quote}>
          <figure className={styles.quoteFigure}>
            <span className={styles.quoteMark} aria-hidden="true" data-reveal="scale">
              “
            </span>
            <blockquote className={styles.quoteText} data-reveal="mask">
              {section.text}
            </blockquote>
            <figcaption className={styles.quoteNote} data-reveal="fade">
              {section.note}
            </figcaption>
          </figure>
          <div className={styles.quoteMedia} data-reveal="right">
            <ImageSlot slot={section.image} sizes="(min-width: 1024px) 30vw, 100vw" variant={index + 1} />
          </div>
        </Reveal>
      );

    case "faq":
      return (
        <Reveal as="section" className={styles.faq} stagger={0.1}>
          <div className={styles.faqHead}>
            <p className={styles.label} data-reveal="fade">
              {section.label}
            </p>
            <h2 className={styles.heading} data-reveal="left">
              {section.heading}
            </h2>
          </div>
          <div className={styles.faqList}>
            {section.items.map((item) => (
              <details key={item.q} className={styles.faqItem} data-reveal>
                <summary className={styles.faqQuestion}>
                  <span>{item.q}</span>
                  <span className={styles.faqIcon} aria-hidden="true" />
                </summary>
                <p className={styles.faqAnswer}>{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      );
  }
}

/* ── Closing ─────────────────────────────────────────────────────── */

export function ProgramCta({ cta }: { cta: ProgramPage["cta"] }) {
  return (
    <Reveal as="section" className={styles.cta}>
      <h2 className={styles.ctaHeading} data-reveal>
        {cta.heading}
      </h2>
      <p className={styles.ctaText} data-reveal="fade">
        {cta.text}
      </p>
      <ul className={styles.ctaActions} role="list" data-reveal>
        {cta.actions.map((action) => (
          <li key={action.href}>
            <Link href={action.href} className={cx(styles.ctaAction, action.primary && styles.ctaPrimary)}>
              {action.label}
              <ArrowRightIcon size={12} />
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export function OtherPrograms({ items }: { items: { slug: string; number: string; title: string; href: string }[] }) {
  return (
    <Reveal as="nav" className={styles.others} aria-label="Other program areas" stagger={0.06}>
      <p className={styles.label} data-reveal="fade">
        Other areas
      </p>
      <ul role="list" className={styles.otherList}>
        {items.map((item) => (
          <li key={item.slug} data-reveal>
            <Link href={item.href} className={styles.otherLink}>
              <span className={styles.otherNumber}>{item.number}</span>
              <span className={styles.otherTitle}>{item.title}</span>
              <ArrowRightIcon size={16} />
            </Link>
          </li>
        ))}
      </ul>
    </Reveal>
  );
}
