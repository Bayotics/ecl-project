import Link from "next/link";

import type { ResolvedMedia } from "@/content/types";
import { MediaImage } from "@/components/ui/MediaImage";

import styles from "./page.module.css";

export interface CardItem {
  href: string;
  title: string;
  summary?: string;
  meta?: string;
  media?: ResolvedMedia;
}

/** Three-up grid of linked cards; used by the causes, news and get-involved skeletons. */
export function CardGrid({ items }: { items: CardItem[] }) {
  return (
    <ul role="list" className={styles.cards}>
      {items.map((item) => (
        <li key={item.href}>
          <article className={styles.card}>
            {item.media ? (
              <div className={styles.cardMedia}>
                <MediaImage
                  media={item.media}
                  decorative
                  sizes="(min-width: 1024px) 20vw, (min-width: 768px) 30vw, 92vw"
                  className={styles.cover}
                />
              </div>
            ) : null}
            {item.meta ? <p className={styles.cardMeta}>{item.meta}</p> : null}
            <h3 className={styles.cardTitle}>
              <Link href={item.href} className={styles.cardLink}>
                {item.title}
              </Link>
            </h3>
            {item.summary ? <p className={styles.cardSummary}>{item.summary}</p> : null}
          </article>
        </li>
      ))}
    </ul>
  );
}
