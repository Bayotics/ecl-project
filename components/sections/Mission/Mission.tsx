import { Reveal } from "@/components/motion/Reveal";
import layout from "@/styles/layout.module.css";
import { cx } from "@/lib/cx";

import styles from "./Mission.module.css";
import { SpeechVideoCard, type SpeechVideo } from "./SpeechVideoCard";

interface MissionProps {
  label: string;
  paragraphs: string[];
  video: SpeechVideo;
}

/** Section 2 — spacious mission block across two thirds, with the President's address in the final third. */
export function Mission({ label, paragraphs, video }: MissionProps) {
  return (
    <section
      id="mission"
      className={cx(styles.mission, layout.rules, layout.rulesSecond)}
      aria-labelledby="mission-heading"
    >
      <Reveal className={cx(layout.cells, styles.inner)}>
        <div className={cx(layout.cell, layout.span2, styles.content)}>
          <h2 id="mission-heading" className={cx(layout.label, styles.label)} data-reveal="fade">
            {label}
          </h2>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className={styles.lead} data-reveal="left">
              {paragraph}
            </p>
          ))}
        </div>
        <div className={cx(layout.cell, styles.aside)} data-reveal="mask">
          <SpeechVideoCard video={video} />
        </div>
      </Reveal>
    </section>
  );
}
