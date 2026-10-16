import type { RevealPanelContent } from "@/content/types";
import layout from "@/styles/layout.module.css";
import { cx } from "@/lib/cx";

import { Reveal } from "@/components/motion/Reveal";

import { RevealPanel } from "./RevealPanel";
import styles from "./IntroPanels.module.css";

interface IntroPanelsProps {
  intro: { label: string; heading: string; paragraphs: string[] };
  impact: RevealPanelContent;
  causes: RevealPanelContent;
}

/**
 * Section 3 — three flush panels on one baseline: gutter→⅓ (static editorial), ⅓→⅔ (impact),
 * ⅔→gutter (causes). docs/ui-spec.md Part F.
 */
export function IntroPanels({ intro, impact, causes }: IntroPanelsProps) {
  return (
    <div className={styles.section}>
      <Reveal className={styles.row} stagger={0.12}>
        <section className={styles.intro} aria-labelledby="intro-heading" data-reveal data-reveal-y="40">
          <p className={cx(layout.label, styles.label)}>{intro.label}</p>
          <h2 id="intro-heading" className={styles.heading}>
            {intro.heading}
          </h2>
          <div className={styles.copy}>
            {intro.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
        <RevealPanel content={impact} tone="dark" />
        <RevealPanel content={causes} tone="light" />
      </Reveal>
    </div>
  );
}
