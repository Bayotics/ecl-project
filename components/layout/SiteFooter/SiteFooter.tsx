import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/media/ecl-crest.png";
import { DialogLink } from "@/components/forms/DialogLink";
import type { FooterColumn, FooterLink, LinkItem } from "@/content/types";

import { Reveal } from "@/components/motion/Reveal";

import { BackToTop } from "./BackToTop";
import styles from "./SiteFooter.module.css";

interface SiteFooterProps {
  siteName: string;
  legalLine: string;
  columns: FooterColumn[];
  legalLinks: LinkItem[];
}

/** Lets long email addresses wrap after the @ instead of mid-word in narrow columns. */
function breakable(label: string) {
  const at = label.indexOf("@");
  if (at < 0) return label;
  return (
    <>
      {label.slice(0, at + 1)}
      <wbr />
      {label.slice(at + 1)}
    </>
  );
}

function FooterAnchor({ link }: { link: FooterLink }) {
  const label = breakable(link.label);
  if (link.dialog) {
    return (
      <DialogLink dialog={link.dialog} href={link.href}>
        {label}
      </DialogLink>
    );
  }
  // tel:, mailto: and approved social accounts are not app routes.
  if (!link.href.startsWith("/")) {
    const external = /^https?:/.test(link.href);
    return (
      <a href={link.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {label}
      </a>
    );
  }
  return <Link href={link.href}>{label}</Link>;
}

/** Site footer (docs/ui-spec.md I5): logo strip, six ruled columns, legal row. */
export function SiteFooter({ siteName, legalLine, columns, legalLinks }: SiteFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer id="site-footer" className={styles.footer}>
      <div className={styles.logoStrip}>
        <Link href="/" className={styles.mark} aria-label={`${siteName}, home`}>
          <Image src={logo} alt="" width={72} height={72} className={styles.logo} />
          <span className={styles.wordmark} aria-hidden="true">
            Eko Club <span>Louisiana</span>
          </span>
        </Link>
        <BackToTop className={styles.top} />
      </div>

      <Reveal as="nav" aria-label="Footer" className={styles.columns} stagger={0.06}>
        {columns.map((column) => (
          <div key={column.heading} className={styles.column} data-reveal="fade">
            <h2 className={styles.heading}>{column.heading}</h2>
            {column.lines?.length ? (
              <div className={styles.lines}>
                {column.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            ) : null}
            {column.links.length ? (
              <ul role="list" className={styles.links}>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <FooterAnchor link={link} />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </Reveal>

      <div className={styles.legal}>
        <p>
          © {year} {siteName}. {legalLine}
        </p>
        <ul role="list" className={styles.legalLinks}>
          {legalLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
