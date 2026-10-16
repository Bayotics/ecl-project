import type { ResolvedMedia } from "@/content/types";
import { MediaImage } from "@/components/ui/MediaImage";
import layout from "@/styles/layout.module.css";
import { cx } from "@/lib/cx";

import styles from "./page.module.css";

interface PageIntroProps {
  label: string;
  title: string;
  lead?: string;
  media?: ResolvedMedia;
}

/** Opening block for inner pages: label in column 1, h1 and lead across columns 2–3, optional wide photo. */
export function PageIntro({ label, title, lead, media }: PageIntroProps) {
  return (
    <div className={cx(styles.intro, layout.rules, layout.rulesFirst)}>
      <div className={layout.cells}>
        <div className={layout.cell}>
          <p className={cx(layout.label, styles.introLabel)}>{label}</p>
        </div>
        <div className={cx(layout.cell, layout.span2)}>
          <h1 className={styles.title}>{title}</h1>
          {lead ? <p className={styles.lead}>{lead}</p> : null}
        </div>
      </div>
      {media ? (
        <div className={styles.introMedia}>
          <MediaImage media={media} sizes="100vw" preload />
        </div>
      ) : null}
    </div>
  );
}
