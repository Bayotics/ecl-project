"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react";

import type { RevealPanelContent } from "@/content/types";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediaImage } from "@/components/ui/MediaImage";
import { cx } from "@/lib/cx";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

import styles from "./RevealPanel.module.css";

interface RevealPanelProps {
  content: RevealPanelContent;
  tone: "dark" | "light";
}

/**
 * Impact / causes panel (docs/ui-spec.md Part F). Default: title + tiny arrow top-left, photograph
 * lower-right. Active: the photograph fades out, the title travels to the bottom-left anchor and the
 * paragraph/action or link list is revealed in the upper area. One paused GSAP timeline, played or
 * reversed, so any interruption reverses from where it is. The panel never changes size.
 */
export function RevealPanel({ content, tone }: RevealPanelProps) {
  const rootRef = useRef<HTMLElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const lastInput = useRef<string>("");

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  // Explicit disclosure (click, tap, Enter/Space). `null` defers to hover/focus.
  const [pinned, setPinned] = useState<boolean | null>(null);
  const active = pinned ?? (hovered || focused);

  const bodyId = `panel-${content.id}-body`;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      const q = gsap.utils.selector(root);
      const title = q("[data-panel-title]")[0] as HTMLElement | undefined;
      if (!title) return;

      // Travel from the top anchor to the bottom anchor (title sits one padding above the bottom edge).
      const travel = () => {
        const pad = parseFloat(getComputedStyle(root).paddingBottom) || 0;
        return root.clientHeight - pad - title.offsetHeight - title.offsetTop;
      };

      const tl = gsap.timeline({ paused: true });
      tl.to(q("[data-panel-media]"), { opacity: 0, duration: 0.2, ease: "power2.out" }, 0)
        .to(title, { y: travel, duration: 0.48, ease: "power2.inOut" }, 0)
        .fromTo(
          q("[data-panel-item]"),
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.03 },
          0.1,
        );
      timeline.current = tl;

      // Re-measure the travel when the panel resizes, keeping the current progress.
      const observer = new ResizeObserver(() => {
        const progress = tl.progress();
        tl.progress(0).invalidate().progress(progress);
      });
      observer.observe(root);
      return () => {
        observer.disconnect();
        timeline.current = null;
      };
    },
    { scope: rootRef },
  );

  useEffect(() => {
    const tl = timeline.current;
    if (!tl) return;
    if (prefersReducedMotion()) {
      tl.pause().progress(active ? 1 : 0);
      return;
    }
    if (active) tl.play();
    else tl.reverse();
  }, [active]);

  const onPointerEnter = (event: PointerEvent) => {
    if (event.pointerType === "mouse") setHovered(true);
  };

  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    setHovered(false);
    setPinned(null);
  };

  // Mouse users drive the panel by hovering; taps and keys toggle it explicitly. A tap only expands,
  // so the revealed links are separate, deliberate actions.
  const onToggleClick = () => {
    if (lastInput.current === "mouse") return;
    setPinned(!active);
  };

  // Keyboard focus opens the panel; focus from a click or tap would otherwise keep it stuck open.
  const onFocus = (event: FocusEvent<HTMLElement>) => {
    if (event.target.matches(":focus-visible")) setFocused(true);
  };

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (rootRef.current?.contains(event.relatedTarget as Node | null)) return;
    setFocused(false);
    setPinned(null);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    lastInput.current = "keyboard";
    if (event.key === "Escape" && active) {
      setPinned(false);
      rootRef.current?.querySelector<HTMLElement>("[data-panel-title] button")?.focus();
    }
  };

  return (
    <article
      ref={rootRef}
      className={cx(styles.panel, styles[tone])}
      data-active={active}
      data-surface={tone}
      // Scroll entrance when inside a <Reveal> (homepage); ignored elsewhere.
      data-reveal
      data-reveal-y="40"
      aria-labelledby={`panel-${content.id}-title`}
      onPointerDown={(event) => {
        lastInput.current = event.pointerType;
      }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      <h2 id={`panel-${content.id}-title`} className={styles.title} data-panel-title>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={active}
          aria-controls={bodyId}
          onClick={onToggleClick}
        >
          <span>{content.title}</span>
          <span className={styles.arrow} aria-hidden="true">
            <ArrowRightIcon size={10} />
          </span>
        </button>
      </h2>

      <div className={styles.media} data-panel-media aria-hidden={active}>
        <MediaImage media={content.media} sizes="(min-width: 1024px) 20vw, 60vw" />
      </div>

      {/* Concealed content is inert: no pointer or keyboard interaction until revealed. */}
      <div id={bodyId} className={styles.body} inert={!active}>
        {content.body ? (
          <p className={styles.text} data-panel-item>
            {content.body}
          </p>
        ) : null}
        {content.action ? (
          <div data-panel-item>
            <Link href={content.action.href} className={styles.action}>
              <span>{content.action.label}</span>
              <ArrowRightIcon size={12} />
            </Link>
          </div>
        ) : null}
        {content.links?.length ? (
          <ul role="list" className={styles.links}>
            {content.links.map((link) => (
              <li key={link.href} data-panel-item>
                <Link href={link.href} className={styles.link}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
