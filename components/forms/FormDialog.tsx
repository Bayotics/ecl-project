"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { keepTabInside } from "@/lib/focus-trap";

import styles from "./forms.module.css";

interface FormDialogProps {
  id: string;
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Light modal panel built on the native <dialog> (showModal): top layer, focus containment and inert
 * page for free. Escape and backdrop clicks close it; focus returns to whatever opened it, and page
 * scroll is held while it is open so the position is restored exactly.
 */
export function FormDialog({ id, title, open, onClose, children }: FormDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const { lock, unlock } = useSmoothScroll();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    dialog.showModal();
    // Start on the first field rather than the close button. Form code may still be arriving, so wait
    // for the field to mount, unless the visitor has already moved focus somewhere else.
    const FIELD = "input:not([tabindex='-1']), select, textarea";
    const focusField = () => {
      const field = dialog.querySelector<HTMLElement>(FIELD);
      if (!field) return false;
      const active = document.activeElement;
      if (active === dialog || active === document.body || active?.getAttribute("aria-label") === "Close") field.focus();
      return true;
    };
    let observer: MutationObserver | null = null;
    if (!focusField()) {
      observer = new MutationObserver(() => {
        if (focusField()) observer?.disconnect();
      });
      observer.observe(dialog, { childList: true, subtree: true });
    }
    lock();
    return () => {
      observer?.disconnect();
      if (dialog.open) dialog.close();
      unlock();
      returnFocus.current?.focus({ preventScroll: true });
    };
  }, [open, lock, unlock]);

  // Backdrop click: the click lands on the <dialog> element itself, outside the inner panel.
  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return (
    <dialog
      ref={ref}
      id={id}
      className={styles.dialog}
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={onClick}
      onKeyDown={keepTabInside}
    >
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 id={`${id}-title`} className={styles.panelTitle}>
            {title}
          </h2>
          <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
        {/* Form content mounts only while open: nothing to hydrate on page load. */}
        {open ? children : null}
      </div>
    </dialog>
  );
}
