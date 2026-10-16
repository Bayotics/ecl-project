import Link from "next/link";

import type { LinkItem, ResolvedMedia } from "@/content/types";
import { DialogLink } from "@/components/forms/DialogLink";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediaImage } from "@/components/ui/MediaImage";
import layout from "@/styles/layout.module.css";
import { cx } from "@/lib/cx";

import styles from "./NewsEvents.module.css";

/** A published, approved news item or correctly dated event, prepared on the server. */
export interface FeedCard {
  slug: string;
  title: string;
  href: string;
  /** e.g. "Archive · December 2018" */
  meta: string;
  media: ResolvedMedia;
}

interface NewsEventsProps {
  heading: string;
  action: LinkItem;
  items: FeedCard[];
}

const SLOTS = 3;

/**
 * Section 7 — News & Events (docs/ui-spec.md I1). Heading and overview link in the left third; three
 * equal story columns across the other two. With fewer than three approved records, the open slot says
 * so truthfully instead of showing an invented headline or date.
 */
export function NewsEvents({ heading, action, items }: NewsEventsProps) {
  const shown = items.slice(0, SLOTS);

  return (
    <section className={cx(styles.news, layout.rules, layout.rulesFirst)} aria-labelledby="news-heading">
      <div className={layout.cells}>
        <Reveal className={cx(layout.cell, styles.head)}>
          <h2 id="news-heading" className={styles.heading} data-reveal="left">
            {heading}
          </h2>
          <Link href={action.href} className={styles.overview} data-reveal="fade">
            <span className={styles.mark} aria-hidden="true" />
            <span>{action.label}</span>
          </Link>
        </Reveal>
        <Reveal className={cx(layout.cell, layout.span2)}>
          <ul role="list" className={styles.stories}>
            {shown.map((item) => (
              <li key={item.slug} data-reveal data-reveal-y="36">
                <article className={styles.story}>
                  <div className={styles.media}>
                    <MediaImage
                      media={item.media}
                      decorative
                      sizes="(min-width: 1024px) 20vw, (min-width: 768px) 30vw, 92vw"
                      className={styles.img}
                    />
                  </div>
                  <p className={styles.meta}>{item.meta}</p>
                  <h3 className={styles.title}>
                    <Link href={item.href} className={styles.link}>
                      {item.title}
                    </Link>
                  </h3>
                  <span className={styles.action} aria-hidden="true">
                    Learn more <ArrowRightIcon size={10} />
                  </span>
                </article>
              </li>
            ))}
            {shown.length < SLOTS ? (
              <li data-reveal data-reveal-y="36">
                <article className={styles.story}>
                  <div className={cx(styles.media, styles.empty)} aria-hidden="true">
                    <span>No further updates yet</span>
                  </div>
                  <p className={styles.meta}>Updates</p>
                  <h3 className={styles.title}>More news will appear here as the club publishes it</h3>
                  <DialogLink dialog="newsletter" href="/contact#newsletter" className={styles.actionLink}>
                    Get updates <ArrowRightIcon size={10} />
                  </DialogLink>
                </article>
              </li>
            ) : null}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
