import { CopyLinkButton } from "./CopyLinkButton";
import styles from "./share.module.css";

interface ShareLinksProps {
  /** Absolute canonical URL of the page being shared. */
  url: string;
  title: string;
}

/**
 * Plain share links (no third-party scripts or tracking pixels load until a visitor clicks one), plus a
 * copy-link button.
 */
export function ShareLinks({ url, title }: ShareLinksProps) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const links = [
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { label: "Email", href: `mailto:?subject=${t}&body=${u}` },
  ];

  return (
    <div className={styles.share}>
      <p className={styles.label} id="share-label">
        Share
      </p>
      <ul role="list" className={styles.links} aria-labelledby="share-label">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className={styles.link}
              {...(link.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {link.label}
              {link.href.startsWith("http") ? <span className="visually-hidden"> (opens in a new tab)</span> : null}
            </a>
          </li>
        ))}
        <li>
          <CopyLinkButton url={url} className={styles.link} />
        </li>
      </ul>
    </div>
  );
}
