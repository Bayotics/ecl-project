import Link from "next/link";

import type { LinkItem, ResolvedMedia } from "@/content/types";
import { Reveal } from "@/components/motion/Reveal";
import { MediaImage } from "@/components/ui/MediaImage";
import layout from "@/styles/layout.module.css";
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
 * Section 6 — editorial row on the thirds (docs/ui-spec.md H2): label + heading (left), two short
 * paragraphs + text action (middle), a large ~1:1 photograph (right). Everything aligns to the top.
 */
export function EditorialRow({ label, heading, paragraphs, link, media }: EditorialRowProps) {
  return (
    <section className={cx(styles.editorial, layout.rules)} aria-labelledby="editorial-heading">
      <Reveal className={layout.cells}>
        <div className={layout.cell}>
          <p className={cx(layout.label, styles.label)} data-reveal>
            {label}
          </p>
          <h2 id="editorial-heading" className={styles.heading} data-reveal="left">
            {heading}
          </h2>
        </div>
        <div className={cx(layout.cell, styles.middle)}>
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
        {media ? <div className={cx(layout.cell, styles.imageCell)}>
          <div className={styles.frame} data-reveal="scale">
            <MediaImage media={media} sizes="(min-width: 1024px) 30vw, (min-width: 768px) 46vw, 92vw" />
          </div>
        </div> : null}
      </Reveal>
    </section>
  );
}
