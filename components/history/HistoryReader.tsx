"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";

import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { ArrowRightIcon } from "@/components/ui/icons";
import { keepTabInside } from "@/lib/focus-trap";
import { cx } from "@/lib/cx";

import styles from "./History.module.css";

const OPEN_EVENT = "history:open";
/** The reader opens on load when the address ends in #full-history, so the full account can be linked to. */
const HASH = "#full-history";

/** Opens the full-history reader (any number of these can sit on the page). */
export function ReadHistoryButton({ label, tone = "dark" }: { label: string; tone?: "dark" | "light" }) {
  return (
    <button
      type="button"
      className={cx(styles.readButton, tone === "light" && styles.readButtonLight)}
      aria-haspopup="dialog"
      aria-controls="full-history"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
    >
      <span className={styles.readSquare} aria-hidden="true" />
      {label}
      <ArrowRightIcon size={14} />
    </button>
  );
}

/**
 * The full account in a reading window: native <dialog> (top layer, inert page), Escape or a backdrop
 * click closes it, focus returns to the button that opened it, page scroll is held while it is open,
 * and a thin bar shows how far through the text the reader is.
 */
export function HistoryReader({ title, eyebrow, paragraphs }: { title: string; eyebrow: string; paragraphs: string[] }) {
  const ref = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const { lock, unlock } = useSmoothScroll();

  const close = useCallback(() => {
    setOpen(false);
    if (window.location.hash === HASH) history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    const onOpen = () => {
      returnFocus.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    const frame = requestAnimationFrame(() => {
      if (window.location.hash === HASH) onOpen();
    });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    dialog.showModal();
    bodyRef.current?.scrollTo({ top: 0 });
    lock();
    return () => {
      if (dialog.open) dialog.close();
      unlock();
      returnFocus.current?.focus({ preventScroll: true });
    };
  }, [open, lock, unlock]);

  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) close();
  };

  const onScroll = () => {
    const body = bodyRef.current;
    if (!body) return;
    const max = body.scrollHeight - body.clientHeight;
    setProgress(max > 0 ? body.scrollTop / max : 1);
  };

  return (
    <dialog
      ref={ref}
      id="full-history"
      className={styles.reader}
      aria-labelledby="full-history-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={onClick}
      onKeyDown={keepTabInside}
    >
      <div className={styles.readerPanel}>
        <header className={styles.readerHead}>
          <div>
            <p className={styles.readerEyebrow}>{eyebrow}</p>
            <h2 id="full-history-title" className={styles.readerTitle}>
              {title}
            </h2>
          </div>
          <button type="button" className={styles.readerClose} onClick={close} aria-label="Close">
            <span aria-hidden="true" />
          </button>
          <span className={styles.readerProgress} style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
        </header>
        {/* Scrolls on its own; data-lenis-prevent keeps the page's smooth scrolling out of it. */}
        <div ref={bodyRef} className={styles.readerBody} onScroll={onScroll} data-lenis-prevent tabIndex={0}>
          {paragraphs.map((paragraph, index) => (
            <p key={index} className={cx(styles.readerText, index === 0 && styles.readerFirst)}>
              {paragraph}
            </p>
          ))}
          <div className={styles.readerEnd} aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </dialog>
  );
}
