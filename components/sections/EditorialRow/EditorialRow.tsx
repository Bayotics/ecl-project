import Link from "next/link";

import type { LinkItem, ResolvedMedia } from "@/content/types";
import { Reveal } from "@/components/motion/Reveal";
import { MediaImage } from "@/components/ui/MediaImage";
import { cx } from "@/lib/cx";

import styles from "./EditorialRow.module.css";

interface EditorialRowProps {
  label: string;
  heading: string;
  paragraphs: string[];
  link: LinkItem;
  media?: ResolvedMedia;
}

/**
 * Section 6 — editorial band (docs/ui-spec.md H2): an inset mist panel in three columns, as in the
 * reference "Process" band: label + heading (left), short paragraphs + square-marked text action
 * (middle, divided by a thin rule), and a photograph filling the right column at full height.
 */
export function EditorialRow({ label, heading, paragraphs, link, media }: EditorialRowProps) {
  return (
    <section className={styles.editorial} aria-labelledby="editorial-heading">
      <Reveal className={cx(styles.band, !media && styles.noMedia)}>
        <div className={styles.cell}>
          <p className={styles.label} data-reveal>
            {label}
          </p>
          <h2 id="editorial-heading" className={styles.heading} data-reveal="left">
            {heading}
          </h2>
        </div>
        <div className={cx(styles.cell, styles.middle)}>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className={styles.body} data-reveal>
              {paragraph}
            </p>
          ))}
          <div data-reveal>
            <Link href={link.href} className={styles.action}>
              <span className={styles.mark} aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          </div>
        </div>
        {media ? (
          <div className={styles.imageCell} data-reveal="fade">
            <MediaImage media={media} sizes="(min-width: 1024px) 32vw, 92vw" />
          </div>
        ) : null}
      </Reveal>
    </section>
  );
}
