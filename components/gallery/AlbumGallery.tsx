"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";

import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { ArrowButton } from "@/components/ui/ArrowButton";
import { MediaImage } from "@/components/ui/MediaImage";
import type { ResolvedMedia } from "@/content/types";
import { keepTabInside } from "@/lib/focus-trap";

import styles from "./gallery.module.css";

export interface GalleryPhoto {
  media: ResolvedMedia;
  caption: string | null;
  credit: string | null;
}

/**
 * Album grid with an accessible lightbox (native modal dialog): close button, previous/next buttons,
 * ←/→ keys, Escape, captions with a position counter, and focus returned to the opening thumbnail.
 * Without JavaScript each thumbnail is a plain link to the full-size photograph.
 */
export function AlbumGallery({ title, photos }: { title: string; photos: GalleryPhoto[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [index, setIndex] = useState<number | null>(null);
  const { lock, unlock } = useSmoothScroll();
  const open = index !== null;
  const count = photos.length;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    dialog.showModal();
    lock();
    return () => {
      if (dialog.open) dialog.close();
      unlock();
      opener.current?.focus({ preventScroll: true });
    };
  }, [open, lock, unlock]);

  const show = (event: MouseEvent<HTMLAnchorElement>, i: number) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    opener.current = event.currentTarget;
    setIndex(i);
  };

  const step = (delta: number) => setIndex((i) => (i === null ? i : (i + delta + count) % count));

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    keepTabInside(event);
    if (count < 2) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  const current = index === null ? null : photos[index];

  return (
    <>
      <ul role="list" className={styles.grid} data-count={count}>
        {photos.map((photo, i) => (
          <li key={`${photo.media.src.src}-${i}`}>
            <a
              href={photo.media.src.src}
              className={styles.thumb}
              onClick={(event) => show(event, i)}
              aria-haspopup="dialog"
              aria-label={`Open photo ${i + 1} of ${count}: ${photo.caption ?? photo.media.alt}`}
            >
              <span className={styles.thumbFrame} style={{ aspectRatio: `${photo.media.src.width} / ${photo.media.src.height}` }}>
                <MediaImage media={photo.media} decorative sizes="(min-width: 1024px) 64vw, 92vw" className={styles.thumbImage} />
              </span>
            </a>
            {photo.caption ? <p className={styles.thumbCaption}>{photo.caption}</p> : null}
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        className={styles.lightbox}
        aria-label={`${title}: photo viewer`}
        onCancel={(event) => {
          event.preventDefault();
          setIndex(null);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setIndex(null);
        }}
        onKeyDown={onKeyDown}
      >
        {current ? (
          <div className={styles.viewer}>
            <div className={styles.bar}>
              <p className={styles.counter} aria-live="polite">
                Photo {index! + 1} of {count}
              </p>
              <button type="button" className={styles.close} aria-label="Close photo viewer" onClick={() => setIndex(null)} autoFocus>
                <span aria-hidden="true" />
                <span aria-hidden="true" />
              </button>
            </div>
            <figure className={styles.figure}>
              <div className={styles.stage}>
                <Image
                  key={current.media.src.src}
                  src={current.media.src}
                  alt={current.media.alt}
                  fill
                  sizes="100vw"
                  className={styles.full}
                />
              </div>
              <figcaption className={styles.caption}>
                {current.caption ? <span>{current.caption}</span> : null}
                {current.credit ? <span className={styles.credit}>Photograph: {current.credit}</span> : null}
              </figcaption>
            </figure>
            {count > 1 ? (
              <div className={styles.nav}>
                <ArrowButton direction="prev" label="Previous photo" tone="light" onClick={() => step(-1)} />
                <ArrowButton direction="next" label="Next photo" tone="light" onClick={() => step(1)} />
              </div>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}
