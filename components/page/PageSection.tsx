import type { ReactNode } from "react";

import layout from "@/styles/layout.module.css";
import { cx } from "@/lib/cx";

import styles from "./page.module.css";

interface PageSectionProps {
  id: string;
  title: string;
  children: ReactNode;
  tone?: "paper" | "mist";
}

/** Ruled section: heading in column 1, content across columns 2–3. */
export function PageSection({ id, title, children, tone = "paper" }: PageSectionProps) {
  return (
    <section
      id={id}
      className={cx(styles.section, layout.rules, layout.rulesFirst, tone === "mist" && styles.mist)}
      aria-labelledby={`${id}-heading`}
    >
      <div className={layout.cells}>
        <div className={layout.cell}>
          <h2 id={`${id}-heading`} className={styles.sectionTitle}>
            {title}
          </h2>
        </div>
        <div className={cx(layout.cell, layout.span2, styles.sectionBody)}>{children}</div>
      </div>
    </section>
  );
}
