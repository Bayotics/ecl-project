"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";

import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { ArrowButton } from "@/components/ui/ArrowButton";
import { LoadingImage, LoadingVideoThumb } from "@/components/ui/LoadingImage";
import { keepTabInside } from "@/lib/focus-trap";

import styles from "./montage.module.css";

export interface MontageItem {
  id: string;
  kind: "image" | "video";
  /** What is shown: the web-size copy of a photo (or the original when it has none), or the video. */
  src: string;
  /** The full-resolution photo, linked as "Full-size photo". */
  full: string;
  poster: string;
  /** Whether src / poster are in the site's R2 bucket, so the image optimizer may resize them. */
  optimize: boolean;
  optimizePoster: boolean;
  alt: string;
  title: string;
  caption: string;
}

/** How many photos a category shows on the page; "See all" opens the rest. */
const ON_PAGE = 5;

type View = null | "wall" | number;

/** A resized copy for each place (montage tile, wall, thumbnail strip), with a spinner until it arrives. */
function Thumb({ item, sizes, eager }: { item: MontageItem; sizes: string; eager?: boolean }) {
  const loading = eager ? "eager" : "lazy";
  if (item.kind === "video") {
    return (
      <>
        {item.poster ? <LoadingImage src={item.poster} alt="" sizes={sizes} quality={75} loading={loading} unoptimized={!item.optimizePoster} /> : <LoadingVideoThumb src={item.src} />}
        <span className={styles.play} aria-hidden="true" />
      </>
    );
  }
  return <LoadingImage src={item.src} alt="" sizes={sizes} quality={75} loading={loading} unoptimized={!item.optimize} />;
}

const SLIDE_SIZES = "100vw";

/**
 * One event category on the Events page: five photos and videos in a montage, and a "See all" button
 * opening every item in a full-screen viewer (native modal dialog) with two views: a montage wall of
 * everything, and a slideshow (←/→ keys, swipe, thumbnail strip). Escape closes it and focus returns to
 * the button that opened it. Without JavaScript each tile is a link to the file itself.
 */
export function CollectionMontage({ id, index, title, description, items }: { id: string; index: number; title: string; description: string | null; items: MontageItem[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const strip = useRef<HTMLOListElement>(null);
  const swipe = useRef<number | null>(null);
  const [view, setView] = useState<View>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const { lock, unlock } = useSmoothScroll();
  const open = view !== null;
  const count = items.length;
  const shown = items.slice(0, ON_PAGE);
  const more = count - ON_PAGE;
  const photos = items.filter((item) => item.kind === "image").length;
  const videos = count - photos;
  const tally = [photos && `${photos} ${photos === 1 ? "photo" : "photos"}`, videos && `${videos} ${videos === 1 ? "video" : "videos"}`].filter(Boolean).join(" · ");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    dialog.showModal();
    dialog.querySelector<HTMLElement>("[data-close]")?.focus();
    lock();
    return () => {
      if (dialog.open) dialog.close();
      unlock();
      opener.current?.focus({ preventScroll: true });
    };
  }, [open, lock, unlock]);

  const slide = typeof view === "number" ? view : null;

  // Switching views removes the button that was pressed: keep focus (and the arrow keys) in the viewer.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog?.open && !dialog.contains(document.activeElement)) dialog.focus({ preventScroll: true });
  }, [view]);

  // Keep the active thumbnail in view.
  useEffect(() => {
    if (slide === null) return;
    strip.current?.querySelector<HTMLElement>(`[data-index="${slide}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [slide]);

  const launch = (event: MouseEvent<HTMLElement>, next: View) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    opener.current = event.currentTarget;
    setDirection(1);
    setView(next);
  };

  const step = useCallback(
    (delta: 1 | -1) => {
      setDirection(delta);
      setView((current) => (typeof current === "number" ? (current + delta + count) % count : current));
    },
    [count],
  );

  const go = (to: number) => {
    setDirection(slide === null || to >= slide ? 1 : -1);
    setView(to);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    keepTabInside(event);
    if (slide === null || count < 2) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") swipe.current = event.clientX;
  };
  const onPointerUp = (event: PointerEvent) => {
    if (swipe.current === null) return;
    const dx = event.clientX - swipe.current;
    swipe.current = null;
    if (Math.abs(dx) > 50 && count > 1) step(dx < 0 ? 1 : -1);
  };

  const current = slide === null ? null : items[slide];

  return (
    <section className={styles.collection} id={`collection-${id}`} aria-labelledby={`collection-${id}-title`}>
      <header className={styles.head} data-reveal>
        <span className={styles.number} aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className={styles.headText}>
          <h3 id={`collection-${id}-title`}>{title}</h3>
          <p>{description ? `${tally} · ${description}` : tally}</p>
        </div>
        {count > 1 && (
          <button type="button" className={styles.seeAll} onClick={(event) => launch(event, "wall")} aria-haspopup="dialog">
            See all {count}
            <span aria-hidden="true" className={styles.seeAllIcon} />
          </button>
        )}
      </header>

      <ul role="list" className={styles.montage} data-count={shown.length}>
        {shown.map((item, i) => {
          const last = i === ON_PAGE - 1 && more > 0;
          return (
            <li key={item.id} className={styles.tile} data-reveal="scale">
              <a
                href={item.full}
                onClick={(event) => launch(event, last ? "wall" : i)}
                aria-haspopup="dialog"
                aria-label={last ? `See all ${count} in ${title}` : `Open ${item.kind === "video" ? "video" : "photo"} ${i + 1} of ${count}: ${item.alt}`}
              >
                <Thumb item={item} sizes={i === 0 ? "(min-width: 700px) 50vw, 100vw" : "(min-width: 700px) 25vw, 50vw"} eager={i === 0} />
                {last ? (
                  <span className={styles.more}>
                    <strong>+{more}</strong>
                    <span>See all</span>
                  </span>
                ) : (
                  <span className={styles.tileTitle} aria-hidden="true">
                    {item.caption || item.title}
                  </span>
                )}
              </a>
            </li>
          );
        })}
      </ul>

      <dialog
        ref={dialogRef}
        className={styles.viewer}
        aria-label={`${title}: all photos and videos`}
        onCancel={(event) => {
          event.preventDefault();
          setView(null);
        }}
        onKeyDown={onKeyDown}
        tabIndex={-1}
      >
        {open && (
          <div className={styles.shell} data-view={slide === null ? "wall" : "slides"}>
            <div className={styles.bar}>
              <div className={styles.barTitle}>
                <p>{tally}</p>
                <h2>{title}</h2>
              </div>
              <div className={styles.views} role="group" aria-label="View">
                <button type="button" aria-pressed={slide === null} onClick={() => setView("wall")}>
                  Montage
                </button>
                <button type="button" aria-pressed={slide !== null} onClick={() => go(slide ?? 0)}>
                  Slideshow
                </button>
              </div>
              <button type="button" className={styles.close} aria-label="Close" onClick={() => setView(null)} data-close>
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </button>
            </div>

            {current === null ? (
              <ul role="list" className={styles.wall}>
                {items.map((item, i) => (
                  <li key={item.id} style={{ "--i": Math.min(i, 24) } as CSSProperties}>
                    <button type="button" onClick={() => go(i)} aria-label={`Open ${item.kind === "video" ? "video" : "photo"} ${i + 1} of ${count}: ${item.alt}`}>
                      <Thumb item={item} sizes="(min-width: 1100px) 23vw, (min-width: 700px) 31vw, 50vw" eager={i < 12} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <figure className={styles.slide}>
                  <div className={styles.stage} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipe.current = null)}>
                    <div key={current.id} className={styles.frame} style={{ "--from": `${direction * 6}%` } as CSSProperties}>
                      {current.kind === "video" ? (
                        <video src={current.src} poster={current.poster || undefined} controls playsInline preload="metadata" aria-label={current.alt} />
                      ) : (
                        <LoadingImage src={current.src} alt={current.alt} sizes={SLIDE_SIZES} quality={90} loading="eager" unoptimized={!current.optimize} frameClassName={styles.slideFrame} style={{ objectFit: "contain" }} />
                      )}
                    </div>
                    {/* The photos either side, fetched at the same size so stepping is instant. */}
                    <div hidden>
                      {[items[(slide! + 1) % count], items[(slide! - 1 + count) % count]].map((near) =>
                        near.kind === "image" && near.id !== current.id ? <Image key={near.id} src={near.src} alt="" fill sizes={SLIDE_SIZES} quality={90} loading="eager" unoptimized={!near.optimize} /> : null,
                      )}
                    </div>
                    {count > 1 && (
                      <>
                        <ArrowButton direction="prev" label="Previous" tone="light" className={styles.prev} onClick={() => step(-1)} />
                        <ArrowButton direction="next" label="Next" tone="light" className={styles.next} onClick={() => step(1)} />
                      </>
                    )}
                  </div>
                  <figcaption className={styles.caption}>
                    <span className={styles.counter} aria-live="polite">
                      {slide! + 1} / {count}
                    </span>
                    <span className={styles.captionText}>{current.caption || current.title}</span>
                    {current.kind === "image" && (
                      <a href={current.full} target="_blank" rel="noopener" className={styles.original}>
                        Full-size photo<span aria-hidden="true"> ↗</span>
                        <span className="visually-hidden"> (opens in a new tab)</span>
                      </a>
                    )}
                  </figcaption>
                </figure>
                {count > 1 && (
                  <ol ref={strip} role="list" className={styles.strip} aria-label="All photos and videos">
                    {items.map((item, i) => (
                      <li key={item.id}>
                        <button type="button" data-index={i} aria-current={i === slide || undefined} aria-label={`${item.kind === "video" ? "Video" : "Photo"} ${i + 1} of ${count}`} onClick={() => go(i)}>
                          <Thumb item={item} sizes="96px" />
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </>
            )}
          </div>
        )}
      </dialog>
    </section>
  );
}
