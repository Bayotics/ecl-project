import Link from "next/link";
import type { Ref } from "react";

import type { HeaderData } from "@/content/types";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediaImage } from "@/components/ui/MediaImage";
import { cx } from "@/lib/cx";

import styles from "./panels.module.css";

interface EventsPanelProps {
  id: string;
  data: HeaderData["events"];
  open: boolean;
  ref?: Ref<HTMLDivElement>;
  onNavigate: () => void;
}

/**
 * B — invitation in the left third; three equal cards across the remaining two thirds.
 * Cards come from event records only; an empty slot says so rather than showing an invented event.
 */
export function EventsPanel({ id, data, open, ref, onNavigate }: EventsPanelProps) {
  return (
    <div id={id} ref={ref} className={cx(styles.panel, styles.events)} inert={!open} data-lenis-prevent>
      <div className={styles.eventsIntro}>
        <div>
          <p className={styles.label} data-panel-item>
            {data.label}
          </p>
          <p className={styles.invitation} data-panel-item>
            {data.invitation}
          </p>
        </div>
        <div data-panel-item>
          <Link href={data.allEvents.href} className={styles.outlineAction} onClick={onNavigate}>
            <span>{data.allEvents.label}</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>

      <ul role="list" className={styles.eventCards}>
        {data.cards.map((card) => (
          <li key={card.kind === "event" ? card.slug : "status"} data-panel-item>
            <article className={styles.eventCard}>
              {card.kind === "event" ? (
                <>
                  <div className={styles.eventMedia}>
                    <MediaImage media={card.media} decorative sizes="(min-width: 1024px) 20vw, 1px" />
                  </div>
                  <h3 className={styles.eventTitle}>
                    <Link href={card.href} className={styles.stretched} onClick={onNavigate}>
                      {card.title}
                    </Link>
                  </h3>
                  <p className={styles.eventMeta}>{card.meta}</p>
                  <span className={styles.tinyAction} aria-hidden="true">
                    Learn more <ArrowRightIcon size={12} />
                  </span>
                </>
              ) : (
                <>
                  <div className={cx(styles.eventMedia, styles.statusMedia)} aria-hidden="true">
                    <span>{card.text}</span>
                  </div>
                  <h3 className={styles.eventTitle}>
                    <Link href={card.action.href} className={styles.stretched} onClick={onNavigate}>
                      {card.title}
                    </Link>
                  </h3>
                  <p className={styles.eventMeta}>{card.text}</p>
                  <span className={styles.tinyAction} aria-hidden="true">
                    {card.action.label} <ArrowRightIcon size={12} />
                  </span>
                </>
              )}
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
