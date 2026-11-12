"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";

import type { ResolvedMedia } from "@/content/types";
import { Reveal } from "@/components/motion/Reveal";
import { ArrowButton } from "@/components/ui/ArrowButton";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediaImage } from "@/components/ui/MediaImage";
import { media } from "@/lib/motion";
import { useMediaQuery } from "@/lib/use-media-query";

import styles from "./CausesCarousel.module.css";

/** A cause record prepared on the server: its href and media resolved. */
export interface CauseItem {
  slug: string;
  number: string;
  title: string;
  short: string;
  href: string;
  media?: ResolvedMedia;
}

interface CausesCarouselProps {
  heading: string;
  causes: CauseItem[];
}

const TRACK_ID = "causes-track";

/**
 * Section 4 — finite causes track (docs/ui-spec.md Part G). Embla, left-aligned and contained: arrows
 * move about one item, drag pulls the row with momentum (dragFree) and settles inside the bounds.
 * No loop, no autoplay. Movement past 7px is a drag, so releasing over a link never follows it.
 */
export function CausesCarousel({ heading, causes }: CausesCarouselProps) {
  const reduced = useMediaQuery(media.reducedMotion);
  const [viewportRef, embla] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    loop: false,
    dragFree: true,
    dragThreshold: 7,
    slidesToScroll: 1,
    // Embla's duration scale: ~30 ≈ a 500ms settle; reduced motion settles almost at once.
    duration: reduced ? 12 : 30,
  });

  // Controls read Embla's position as an external store, so they track arrows, drags and resizes.
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!embla) return () => {};
      const events = ["select", "reInit", "settle", "scroll"] as const;
      events.forEach((event) => embla.on(event, onChange));
      return () => events.forEach((event) => embla.off(event, onChange));
    },
    [embla],
  );
  const canPrev = useSyncExternalStore(subscribe, () => embla?.canScrollPrev() ?? false, () => false);
  const canNext = useSyncExternalStore(subscribe, () => embla?.canScrollNext() ?? true, () => true);

  // Keyboard focus on an offscreen item scrolls it into view.
  const onSlideFocus = (index: number) => {
    if (!embla || embla.slidesInView().includes(index)) return;
    embla.scrollTo(Math.min(index, embla.scrollSnapList().length - 1));
  };

  return (
    <section className={styles.section} aria-labelledby="causes-heading">
      <Reveal className={styles.head}>
        <h2 id="causes-heading" className={styles.heading} data-reveal="left">
          {heading}
        </h2>
        <div className={styles.controls} data-reveal="fade">
          <ArrowButton
            direction="prev"
            label="Previous causes"
            aria-controls={TRACK_ID}
            disabled={!canPrev}
            className={styles.control}
            onClick={() => embla?.scrollPrev()}
          />
          <ArrowButton
            direction="next"
            label="Next causes"
            aria-controls={TRACK_ID}
            disabled={!canNext}
            className={styles.control}
            onClick={() => embla?.scrollNext()}
          />
        </div>
      </Reveal>

      <Reveal>
      <div className={styles.viewport} ref={viewportRef} aria-roledescription="carousel" aria-labelledby="causes-heading">
        <ul id={TRACK_ID} role="list" className={styles.track}>
          {causes.map((cause, index) => (
            <li
              key={cause.slug}
              className={styles.slide}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${causes.length}: ${cause.title}`}
              onFocus={() => onSlideFocus(index)}
            >
              <article className={styles.card} data-reveal="right" data-reveal-x="96">
                {/* Photograph, title and action share one route; the photo link is a pointer shortcut only. */}
                {cause.media ? <Link href={cause.href} className={styles.media} tabIndex={-1} aria-hidden="true" draggable={false} data-reveal="mask">
                  <MediaImage
                    media={cause.media}
                    decorative
                    sizes="(min-width: 1024px) 26vw, (min-width: 768px) 42vw, 82vw"
                    className={styles.img}
                    draggable={false}
                  />
                </Link> : null}
                <h3 className={styles.title}>
                  <Link href={cause.href} draggable={false}>
                    {cause.title}
                  </Link>
                </h3>
                <p className={styles.summary}>{cause.short}</p>
                <Link
                  href={cause.href}
                  className={styles.action}
                  draggable={false}
                  aria-label={`Explore cause: ${cause.title}`}
                >
                  <span>Explore cause</span>
                  <ArrowRightIcon size={10} />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
      </Reveal>
    </section>
  );
}
