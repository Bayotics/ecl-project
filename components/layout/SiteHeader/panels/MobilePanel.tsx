import Link from "next/link";
import { useEffect, useRef, useState, type Ref } from "react";

import type { HeaderData } from "@/content/types";
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { cx } from "@/lib/cx";
import { prefersReducedMotion } from "@/lib/motion";

import { levelTimeline } from "../overlayMotion";
import styles from "./panels.module.css";

type Level = "root" | "programs" | "events";
const LEVELS: Level[] = ["root", "programs", "events"];

interface MobilePanelProps {
  id: string;
  data: HeaderData;
  open: boolean;
  ref?: Ref<HTMLDivElement>;
  onNavigate: () => void;
}

/**
 * Below 1024px: one full-width, tap-driven panel. Programs and Events drill into nested levels with an
 * explicit Back control; Donate stays prominent at the root.
 */
export function MobilePanel({ id, data, open, ref, onNavigate }: MobilePanelProps) {
  const [level, setLevel] = useState<Level>("root");
  const trackRef = useRef<HTMLDivElement>(null);
  const openerRefs = useRef(new Map<Level, HTMLButtonElement>());
  const backRefs = useRef(new Map<Level, HTMLButtonElement>());
  const returnTo = useRef<Level | null>(null);

  // Closing the panel always returns it to the root level.
  const [prevOpen, setPrevOpen] = useState(open);
  if (prevOpen !== open) {
    setPrevOpen(open);
    if (!open) setLevel("root");
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const tween = levelTimeline(track, LEVELS.indexOf(level), prefersReducedMotion() || !open);
    // Move focus with the level: into a nested level's Back control, or back to the item that opened it.
    if (level !== "root") backRefs.current.get(level)?.focus({ preventScroll: true });
    else if (returnTo.current) openerRefs.current.get(returnTo.current)?.focus({ preventScroll: true });
    returnTo.current = null;
    return () => {
      tween.kill();
    };
  }, [level, open]);

  const enter = (next: Level) => setLevel(next);
  const back = (from: Level) => {
    returnTo.current = from;
    setLevel("root");
  };

  const opener = (target: Level, label: string) => (
    <button
      type="button"
      ref={(node) => {
        if (node) openerRefs.current.set(target, node);
      }}
      className={styles.mobileRow}
      aria-expanded={level === target}
      aria-controls={`${id}-${target}`}
      onClick={() => enter(target)}
    >
      <span>{label}</span>
      <ChevronRightIcon size={18} />
    </button>
  );

  const backButton = (from: Level) => (
    <button
      type="button"
      ref={(node) => {
        if (node) backRefs.current.set(from, node);
      }}
      className={styles.backButton}
      onClick={() => back(from)}
    >
      <ChevronLeftIcon size={16} />
      <span>Back</span>
    </button>
  );

  return (
    <div id={id} ref={ref} className={cx(styles.panel, styles.mobile)} inert={!open} data-lenis-prevent>
      <div ref={trackRef} className={styles.mobileTrack}>
        {/* Root */}
        <div className={styles.mobileLevel} inert={level !== "root"}>
          <nav aria-label="Mobile">
            <ul role="list" className={styles.mobileList}>
              {data.nav.map((item) => (
                <li key={item.id} data-panel-item>
                  {item.panel ? (
                    opener(item.panel, item.label)
                  ) : (
                    <Link href={item.href} className={styles.mobileRow} onClick={onNavigate}>
                      <span>{item.label}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className={styles.mobileFooter} data-panel-item>
            <Link href={data.donate.href} className={styles.donateBlock} onClick={onNavigate}>
              <span>{data.donate.label}</span>
              <ArrowRightIcon size={16} />
            </Link>
            <ul role="list" className={styles.mobileUtility}>
              {data.utility.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={onNavigate}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Programs */}
        <div id={`${id}-programs`} className={styles.mobileLevel} inert={level !== "programs"}>
          {backButton("programs")}
          <p className={styles.label}>{data.programs.label}</p>
          <ul role="list" className={styles.mobileList}>
            {data.programs.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.mobileRow} onClick={onNavigate}>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={data.programs.viewAll.href} className={styles.textAction} onClick={onNavigate}>
            <span>{data.programs.viewAll.label}</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>

        {/* Events */}
        <div id={`${id}-events`} className={styles.mobileLevel} inert={level !== "events"}>
          {backButton("events")}
          <p className={styles.label}>{data.events.label}</p>
          <ul role="list" className={styles.mobileList}>
            {data.events.cards.map((card) =>
              card.kind === "event" ? (
                <li key={card.slug}>
                  <Link href={card.href} className={styles.mobileEvent} onClick={onNavigate}>
                    <span>{card.title}</span>
                    <span className={styles.eventMeta}>{card.meta}</span>
                  </Link>
                </li>
              ) : (
                <li key="status">
                  <Link href={card.action.href} className={styles.mobileEvent} onClick={onNavigate}>
                    <span>{card.title}</span>
                    <span className={styles.eventMeta}>{card.text}</span>
                  </Link>
                </li>
              ),
            )}
          </ul>
          <Link href={data.events.allEvents.href} className={styles.textAction} onClick={onNavigate}>
            <span>{data.events.allEvents.label}</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
