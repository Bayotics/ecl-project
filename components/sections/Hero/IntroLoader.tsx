"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import crest from "@/assets/media/ecl-crest.png";
import { useSmoothScroll } from "@/components/providers/SmoothScrollProvider";
import { cx } from "@/lib/cx";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

import styles from "./IntroLoader.module.css";

/** Played once per document load; client-side navigation back to the homepage never repeats it. */
let introPlayed = false;

/** Longest we wait for the font and the hero poster before revealing anyway. */
const READY_CAP_MS = 1800;
/** Mark fade-in (300ms) + brief hold (350ms): the earliest the curtains may lift. */
const MIN_MARK_MS = 650;
/** Absolute backstop: whatever happens, the page is unlocked and revealed by then. */
const FAILSAFE_MS = 4500;

function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

/** Resolves when the locally available fonts and first hero image are usable, or after the cap. */
function essentialsReady(): Promise<void> {
  const font = document.fonts?.ready.then(() => undefined, () => undefined) ?? Promise.resolve();
  const img = document.querySelector<HTMLImageElement>('[data-hero-media="0"] img');
  const poster =
    !img || img.complete
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });
  return Promise.race([Promise.all([font, poster]).then(() => undefined), wait(READY_CAP_MS)]);
}

/**
 * Three-curtain loader above the hero (docs/ui-spec.md E1). A small centered mark fades in, then three
 * independent charcoal curtains lift left → middle → right while the header, copy and controls resolve
 * beneath them. Server-rendered so it covers the first paint; CSS hides it without JS or on failure.
 */
export function IntroLoader() {
  const [show, setShow] = useState(() => !introPlayed);
  const rootRef = useRef<HTMLDivElement>(null);
  const { lock, unlock } = useSmoothScroll();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;
      introPlayed = true;
      // JS has taken over: cancel the CSS failsafe animation.
      root.dataset.controlled = "";

      const header = document.querySelector<HTMLElement>("[data-intro-header]");
      const copy = Array.from(document.querySelectorAll<HTMLElement>("[data-intro-copy]"));
      const controls = document.querySelector<HTMLElement>("[data-intro-controls]");
      const covered = [header, document.querySelector<HTMLElement>("[data-header-overlay]")].filter(
        (el): el is HTMLElement => !!el,
      );
      const revealTargets = [header, ...copy, controls].filter((el): el is HTMLElement => !!el);

      if (prefersReducedMotion()) {
        setShow(false);
        return;
      }

      // Side effects held while the loader covers the page; always released by `restore`.
      let held = true;
      lock();
      covered.forEach((el) => el.setAttribute("inert", ""));
      const restore = () => {
        if (!held) return;
        held = false;
        gsap.set(revealTargets, { clearProps: "opacity,transform" });
        covered.forEach((el) => el.removeAttribute("inert"));
        unlock();
      };
      const complete = () => {
        restore();
        setShow(false);
      };

      // Hidden beneath the curtains, ready to resolve as they lift.
      if (header) gsap.set(header, { opacity: 0 });
      gsap.set(copy, { opacity: 0, y: 24 });
      if (controls) gsap.set(controls, { opacity: 0, y: 12 });

      const mark = root.querySelector<HTMLElement>("[data-loader-mark]");
      const curtains = root.querySelectorAll<HTMLElement>("[data-curtain]");
      gsap.to(mark, { opacity: 1, duration: 0.3, ease: "power2.out" });

      let cancelled = false;
      let exit: gsap.core.Timeline | null = null;
      const failsafe = window.setTimeout(complete, FAILSAFE_MS);

      Promise.all([essentialsReady(), wait(MIN_MARK_MS)]).then(() => {
        if (cancelled) return;
        exit = gsap.timeline({ onComplete: complete });
        exit
          .to(mark, { opacity: 0, y: -6, duration: 0.35, ease: "power2.in" }, 0)
          // Left first, middle +80ms, right +80ms; each lifts in ~750ms, exposing the hero bottom-up.
          .to(curtains, { yPercent: -100, duration: 0.75, ease: "power3.inOut", stagger: 0.08 }, 0.12)
          .to(copy, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.06 }, 0.5)
          .to(header, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.55)
          .to(controls, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.7);
      });

      // Unmount or re-run (Strict Mode): release everything, but leave visibility to the next run.
      return () => {
        cancelled = true;
        window.clearTimeout(failsafe);
        exit?.kill();
        restore();
      };
    },
    { scope: rootRef },
  );

  if (!show) return null;

  return (
    <div ref={rootRef} className={styles.loader} data-loader aria-hidden="true">
      <noscript>
        <style>{"[data-loader]{display:none!important}"}</style>
      </noscript>
      <div className={cx(styles.curtain, styles.left)} data-curtain />
      <div className={cx(styles.curtain, styles.middle)} data-curtain />
      <div className={cx(styles.curtain, styles.right)} data-curtain />
      <div className={styles.mark} data-loader-mark>
        <Image src={crest} alt="" width={44} height={44} loading="eager" />
      </div>
    </div>
  );
}
