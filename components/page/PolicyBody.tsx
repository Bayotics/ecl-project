import type { PolicySection } from "@/content/policies";

import styles from "./page.module.css";

/** Policy text, section by section. */
export function PolicyBody({ sections }: { sections: PolicySection[] }) {
  return (
    <div className={styles.prose}>
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
