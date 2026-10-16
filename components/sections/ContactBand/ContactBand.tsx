import type { LinkItem } from "@/content/types";
import { Reveal } from "@/components/motion/Reveal";
import { DialogLink } from "@/components/forms/DialogLink";
import layout from "@/styles/layout.module.css";
import { cx } from "@/lib/cx";

import styles from "./ContactBand.module.css";

interface ContactBandProps {
  invitation: string[];
  contact: { heading: string; body: string; action: LinkItem };
  newsletter: { heading: string; body: string; action: LinkItem };
  details: { email: string; phone: { display: string; tel: string } };
}

/**
 * Section 8 — spare contact / newsletter band on #E0E0DE (docs/ui-spec.md I2). Both actions are real
 * links to /contact (the no-JS fallback) that open the form dialogs in place.
 */
export function ContactBand({ invitation, contact, newsletter, details }: ContactBandProps) {
  return (
    <section className={cx(styles.band, layout.rules)} aria-labelledby="contact-band-heading">
      <Reveal className={layout.cells}>
        <div className={cx(layout.cell, styles.invite)} data-reveal="left">
          <h2 id="contact-band-heading" className={styles.invitation}>
            {invitation.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h2>
        </div>
        <div className={cx(layout.cell, styles.column)} data-reveal>
          <h3 className={styles.heading}>{contact.heading}</h3>
          <p className={styles.body}>{contact.body}</p>
          <p className={styles.body}>
            Email <a href={`mailto:${details.email}`}>{details.email}</a> or call{" "}
            <a href={`tel:${details.phone.tel}`}>{details.phone.display}</a>.
          </p>
          <DialogLink dialog="contact" href={contact.action.href} className={styles.button}>
            {contact.action.label}
          </DialogLink>
        </div>
        <div id="newsletter" className={cx(layout.cell, styles.column)} data-reveal>
          <h3 className={styles.heading}>{newsletter.heading}</h3>
          <p className={styles.body}>{newsletter.body}</p>
          <DialogLink dialog="newsletter" href={newsletter.action.href} className={styles.textAction}>
            <span className={styles.mark} aria-hidden="true" />
            <span>{newsletter.action.label}</span>
          </DialogLink>
        </div>
      </Reveal>
    </section>
  );
}
