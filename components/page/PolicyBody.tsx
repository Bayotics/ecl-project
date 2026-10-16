import type { PolicySection } from "@/content/policies";

import styles from "./page.module.css";

const formatUpdated = (iso: string) =>
  new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

/** Policy text with its review status shown honestly while it is still a draft. */
export function PolicyBody({ sections, updated, draft }: { sections: PolicySection[]; updated: string; draft: boolean }) {
  return (
    <div className={styles.prose}>
      <p className={styles.notice}>
        {draft ? "Draft notice, pending review by the club. " : ""}Last updated {formatUpdated(updated)}.
      </p>
      {sections.map((section) => (
        <section key={section.heading} aria-label={section.heading} className={styles.prose}>
          <h3>{section.heading}</h3>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.list ? (
            <ul>
              {section.list.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}
