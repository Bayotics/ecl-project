"use client";

import type Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";

import { gsap, scrollTriggerRef } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Native document scrolling, gently weighted on desktop by Lenis (docs/ui-spec.md E4).
 * Lenis only runs where smoothing helps: wide screens, precise pointers, motion allowed. Touch keeps
 * native scrolling. The GSAP ticker is the single animation-frame owner (Lenis `autoRaf: false`).
 */
const SMOOTH_QUERY =
  "(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/** Back-to-top travel (docs/ui-spec.md I6): ≈1.1s with a soft ease-in-out. */
const TOP_DURATION = 1.1;
const softEase = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

interface SmoothScrollApi {
  scrollToTop: (onComplete?: () => void) => void;
  /** Scrolls an element to just below the pinned navigation bar. */
  scrollToTarget: (target: HTMLElement, onComplete?: () => void) => void;
  /** Reference-counted page scroll lock (menus). */
  lock: () => void;
  unlock: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null);

export function useSmoothScroll(): SmoothScrollApi {
  const api = useContext(SmoothScrollContext);
  if (!api) throw new Error("useSmoothScroll must be used inside <SmoothScrollProvider>");
  return api;
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const locks = useRef(0);
  const pathname = usePathname();

  useEffect(() => {
    const mql = window.matchMedia(SMOOTH_QUERY);
    let lenis: Lenis | null = null;
    const tick = (time: number) => lenis?.raf(time * 1000);

    let cancelled = false;
    let loading = false;
    // Lenis is fetched only where it runs (desktop, fine pointer, motion allowed); phones never load it.
    const enable = async () => {
      if (lenis || loading) return;
      loading = true;
      const { default: LenisClass } = await import("lenis");
      loading = false;
      if (cancelled || lenis || !mql.matches) return;
      lenis = new LenisClass({
        autoRaf: false,
        lerp: 0.1,
        wheelMultiplier: 1,
        smoothWheel: true,
        // Header offsets come from `scroll-padding-top` on <html>, which Lenis already honors.
        anchors: true,
        stopInertiaOnNavigate: true,
      });
      lenis.on("scroll", () => scrollTriggerRef.current?.update());
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      if (locks.current > 0) lenis.stop();
      lenisRef.current = lenis;
    };

    const disable = () => {
      if (!lenis) return;
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      lenis = null;
      lenisRef.current = null;
    };

    const sync = () => (mql.matches ? void enable() : disable());
    sync();
    mql.addEventListener("change", sync);
    return () => {
      cancelled = true;
      mql.removeEventListener("change", sync);
      disable();
    };
  }, []);

  // Fixed layers (header, menus) span the viewport, while the page grid stops at the scrollbar gutter
  // (a classic scrollbar, or the space `scrollbar-gutter: stable` reserves). Expose that width so fixed
  // layers can stop short of it and keep the thirds grid aligned.
  useEffect(() => {
    const root = document.documentElement;
    const measure = () =>
      // Only the reserved gutter the page grid does not use. A classic scrollbar is already outside a fixed
      // layer's containing block, so it must not be subtracted again (that left a strip beside the header).
      root.style.setProperty("--scrollbar-w", `${Math.max(0, root.clientWidth - document.body.clientWidth)}px`);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // New route content: re-measure scroll limits and trigger positions.
  useEffect(() => {
    lenisRef.current?.resize();
    const id = requestAnimationFrame(() => scrollTriggerRef.current?.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  const scrollToTop = useCallback((onComplete?: () => void) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(0, { duration: TOP_DURATION, easing: softEase, force: true, onComplete: () => onComplete?.() });
      return;
    }
    const from = window.scrollY;
    if (prefersReducedMotion() || from === 0) {
      window.scrollTo({ top: 0, behavior: "auto" });
      onComplete?.();
      return;
    }
    // Native smooth scrolling has no duration control, so the travel is tweened here to match Lenis.
    const root = document.documentElement;
    const behavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    const start = performance.now();
    const cancel = () => {
      window.removeEventListener("wheel", cancel);
      window.removeEventListener("touchstart", cancel);
      cancelAnimationFrame(frame);
      root.style.scrollBehavior = behavior;
    };
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / (TOP_DURATION * 1000));
      window.scrollTo(0, from * (1 - softEase(t)));
      if (t < 1) {
        frame = requestAnimationFrame(step);
        return;
      }
      cancel();
      onComplete?.();
    };
    let frame = requestAnimationFrame(step);
    // The reader can take over at any point.
    window.addEventListener("wheel", cancel, { passive: true, once: true });
    window.addEventListener("touchstart", cancel, { passive: true, once: true });
  }, []);

  const scrollToTarget = useCallback((target: HTMLElement, onComplete?: () => void) => {
    const lenis = lenisRef.current;
    // Both paths honor `scroll-padding-top` (pinned bar + 1rem), so no extra offset is applied here.
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.2, onComplete: () => onComplete?.() });
      return;
    }
    target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    onComplete?.();
  }, []);

  const lock = useCallback(() => {
    locks.current += 1;
    if (locks.current === 1) {
      document.documentElement.dataset.scrollLocked = "";
      lenisRef.current?.stop();
    }
  }, []);

  const unlock = useCallback(() => {
    locks.current = Math.max(0, locks.current - 1);
    if (locks.current === 0) {
      delete document.documentElement.dataset.scrollLocked;
      lenisRef.current?.start();
    }
  }, []);

  const api = useMemo(() => ({ scrollToTop, scrollToTarget, lock, unlock }), [scrollToTop, scrollToTarget, lock, unlock]);

  return <SmoothScrollContext.Provider value={api}>{children}</SmoothScrollContext.Provider>;
}
