"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import type { LinkItem, ResolvedMedia, VideoSource } from "@/content/types";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { ArrowButton } from "@/components/ui/ArrowButton";
import { ArrowRightIcon, PauseIcon, PlayIcon } from "@/components/ui/icons";
import { MediaImage } from "@/components/ui/MediaImage";
import { gsap, useGSAP } from "@/lib/gsap";
import { media as mq, prefersReducedMotion } from "@/lib/motion";
import { useMediaQuery } from "@/lib/use-media-query";

import styles from "./Hero.module.css";
import { HeroVideo, type VideoStatus } from "./HeroVideo";

/** A hero slide record with its media resolved on the server. */
export interface HeroSlideView {
  id: string;
  tab: string;
  eyebrow: string;
  headline: string;
  text: string;
  cta: LinkItem;
  media: ResolvedMedia;
  video: VideoSource[];
}

interface HeroProps {
  /** Visually hidden page heading (the slides carry h2s). */
  heading: string;
  label: string;
  slides: HeroSlideView[];
  /** Element the downward arrow scrolls to. */
  nextSectionId: string;
}

const SWIPE_MIN_PX = 48;

/**
 * Section 1 — cinematic hero (docs/ui-spec.md Part E). One active index drives media, copy and tabs.
 * Manual advancement only: arrows wrap, tabs select directly, horizontal swipes select on touch.
 */
export function Hero({ heading, label, slides, nextSectionId }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const swipe = useRef<{ x: number; y: number; id: number } | null>(null);
  const { scrollToTarget } = useSmoothScroll();
  const reducedMotion = useMediaQuery(mq.reducedMotion);

  const [active, setActive] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  // The visitor's explicit choice; `null` follows the default (play unless reduced motion).
  const [userChoice, setUserChoice] = useState<"play" | "pause" | null>(null);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>("paused");
  const count = slides.length;
  const activeHasVideo = slides[active].video.length > 0 && videoStatus !== "failed";

  /* ── Media lifecycle: play only the active clip, only while visible ── */

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(root);
    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const onActiveStatus = useCallback((status: VideoStatus) => setVideoStatus(status), []);
  const ignoreStatus = useCallback(() => {}, []);

  /* ── Slide changes ───────────────────────────────────────────────── */

  const { contextSafe } = useGSAP({ scope: rootRef });

  const transition = (to: number) => {
    const root = rootRef.current;
    if (!root) return;
    timeline.current?.kill();

    const layers = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-media]"));
    const copies = Array.from(root.querySelectorAll<HTMLElement>("[data-hero-copy]"));
    const target = copies[to];
    const parts = (copy: HTMLElement) => copy.querySelectorAll<HTMLElement>("[data-hero-part]");

    // From here on GSAP owns the visual state; pin current computed values so React's re-render
    // cannot snap anything before the tweens start.
    layers.forEach((layer) => gsap.set(layer, { opacity: Number(getComputedStyle(layer).opacity) }));
    const outgoing = copies.filter((copy) => copy !== target && getComputedStyle(copy).visibility !== "hidden");
    gsap.set(outgoing, { visibility: "visible" });
    if (getComputedStyle(target).visibility === "hidden") gsap.set(parts(target), { opacity: 0, y: 24 });
    gsap.set(target, { visibility: "visible" });

    const tl = gsap.timeline();
    // Outgoing copy lifts ~20px and fades (220ms); the title moves inside its own mask.
    outgoing.forEach((copy) => {
      tl.to(parts(copy), { opacity: 0, y: -20, duration: 0.22, ease: "power2.out", stagger: 0.04 }, 0).set(
        copy,
        { visibility: "hidden" },
        ">",
      );
    });
    // Media crossfade (650ms).
    layers.forEach((layer, index) => {
      tl.to(layer, { opacity: index === to ? 1 : 0, duration: 0.65, ease: "power2.out" }, 0);
    });
    // Incoming copy rises from ~24px below (450ms), staggered 50ms.
    tl.to(parts(target), { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", stagger: 0.05 }, 0.24);

    if (prefersReducedMotion()) tl.progress(1);
    timeline.current = tl;
  };

  const goTo = (index: number) => {
    const next = (index + count) % count;
    if (next === active) return;
    contextSafe(() => transition(next))();
    setActive(next);
    setVideoStatus("paused");
    setAnnouncement(`Slide ${next + 1} of ${count}: ${slides[next].headline}`);
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const targets: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: count - 1,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    const target = (targets[event.key] + count) % count;
    goTo(target);
    tabRefs.current[target]?.focus();
  };

  /* ── Touch swipe: horizontal selects; vertical stays native scrolling (touch-action: pan-y) ── */

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === "mouse") return;
    swipe.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
  };

  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_MIN_PX && Math.abs(dx) > Math.abs(dy) * 1.5) goTo(active + (dx < 0 ? 1 : -1));
  };

  const scrollOn = () => {
    const target = document.getElementById(nextSectionId);
    if (target) scrollToTarget(target);
  };

  const wantsPlayback = userChoice ? userChoice === "play" : !reducedMotion;
  const shouldPlay = (index: number) => index === active && inView && pageVisible && wantsPlayback;
  const paused = videoStatus !== "playing";

  return (
    <section
      ref={rootRef}
      className={styles.hero}
      aria-roledescription="carousel"
      aria-label={label}
      data-header-overlay
      data-surface="dark"
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        swipe.current = null;
      }}
    >
      <h1 className="visually-hidden">{heading}</h1>

      {/* Media: one layer per slide, crossfaded. */}
      <div className={styles.media}>
        {slides.map((slide, index) => (
          <div key={slide.id} className={styles.layer} data-hero-media={index} aria-hidden={index !== active}>
            {slide.video.length ? (
              <HeroVideo
                sources={slide.video}
                poster={slide.media}
                shouldPlay={shouldPlay(index)}
                onStatus={index === active ? onActiveStatus : ignoreStatus}
                eager={index === 0}
              />
            ) : (
              <MediaImage
                media={slide.media}
                sizes="100vw"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
              />
            )}
          </div>
        ))}
        <div className={styles.scrim} aria-hidden="true" />
      </div>

      {/* Copy: one block per slide, stacked and anchored low-left above the control strip. */}
      <div className={styles.stage}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            id={`hero-panel-${slide.id}`}
            role="tabpanel"
            aria-labelledby={`hero-tab-${slide.id}`}
            className={styles.copy}
            data-hero-copy={index}
            inert={index !== active}
          >
            <p className={styles.eyebrow} data-hero-part data-intro-copy={index === 0 || undefined}>
              {slide.eyebrow}
            </p>
            <h2 className={styles.title}>
              <span className={styles.mask}>
                <span className={styles.titleInner} data-hero-part data-intro-copy={index === 0 || undefined}>
                  {slide.headline}
                </span>
              </span>
            </h2>
            <div className={styles.support}>
              <p className={styles.text} data-hero-part data-intro-copy={index === 0 || undefined}>
                {slide.text}
              </p>
              <div data-hero-part data-intro-copy={index === 0 || undefined}>
                <Link href={slide.cta.href} className={styles.cta}>
                  <span>{slide.cta.label}</span>
                  <ArrowRightIcon size={12} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control strip: flat and technical. */}
      <div className={styles.controls} data-intro-controls>
        <div className={styles.arrows}>
          <ArrowButton direction="prev" label="Previous slide" tone="light" size="compact" onClick={() => goTo(active - 1)} />
          <ArrowButton direction="next" label="Next slide" tone="light" size="compact" onClick={() => goTo(active + 1)} />
        </div>
        <span className={styles.divider} aria-hidden="true" />
        <div className={styles.tabs} role="tablist" aria-label={`${label}: choose a slide`}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={`hero-tab-${slide.id}`}
              aria-selected={index === active}
              aria-controls={`hero-panel-${slide.id}`}
              tabIndex={index === active ? 0 : -1}
              className={styles.tab}
              onClick={() => goTo(index)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
            >
              {index + 1}.<span className={styles.tabLabel}> {slide.tab}</span>
            </button>
          ))}
        </div>
        <div className={styles.end}>
          {activeHasVideo ? (
            <button
              type="button"
              className={styles.mediaToggle}
              aria-label={paused ? "Play background video" : "Pause background video"}
              onClick={() => setUserChoice(paused ? "play" : "pause")}
            >
              {paused ? <PlayIcon size={10} /> : <PauseIcon size={10} />}
            </button>
          ) : null}
          <ArrowButton direction="down" label="Scroll to our mission" tone="light" size="compact" onClick={scrollOn} />
        </div>
      </div>

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </section>
  );
}
