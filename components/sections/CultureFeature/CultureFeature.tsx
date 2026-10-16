import Link from "next/link";

import type { LinkItem, ResolvedMedia, VideoSource } from "@/content/types";
import { Reveal } from "@/components/motion/Reveal";
import layout from "@/styles/layout.module.css";
import { cx } from "@/lib/cx";

import { AmbientVideo } from "./AmbientVideo";
import styles from "./CultureFeature.module.css";

interface CultureFeatureProps {
  label: string;
  heading: string;
  link: LinkItem;
  poster: ResolvedMedia;
  video: VideoSource[];
  videoLabel: string;
}

/**
 * Section 5 — charcoal culture feature (docs/ui-spec.md H1). Narrow editorial third (copy near the top,
 * open charcoal beneath), hairline at ⅓, and a large 16:9 media slot inset 28px across the other two.
 */
export function CultureFeature({ label, heading, link, poster, video, videoLabel }: CultureFeatureProps) {
  return (
    <section
      className={cx(styles.culture, layout.rules, layout.rulesFirst, layout.rulesDark)}
      data-surface="dark"
      aria-labelledby="culture-heading"
    >
      <div className={layout.cells}>
        <Reveal className={cx(layout.cell, styles.copy)}>
          <p className={cx(layout.label, styles.label)} data-reveal>
            {label}
          </p>
          {/* Two lines: one per sentence ("Rooted in Lagos." / "Connected in Louisiana."). */}
          <h2 id="culture-heading" className={styles.heading} data-reveal="left">
            {heading.split(/(?<=\.)\s+/).map((line) => (
              <span key={line} className={styles.line}>
                {line}{" "}
              </span>
            ))}
          </h2>
          <div data-reveal>
            <Link href={link.href} className={styles.action}>
              <span className={styles.mark} aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          </div>
        </Reveal>
        <Reveal className={cx(layout.cell, layout.span2)}>
          <div className={styles.frame} data-reveal="mask-left">
            <AmbientVideo
              sources={video}
              poster={poster}
              label={videoLabel}
              sizes="(min-width: 1024px) 64vw, 100vw"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
