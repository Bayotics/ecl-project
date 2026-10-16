"use client";

import { useRef, type ElementType, type ReactNode } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import { ScrollTrigger } from "@/lib/scroll-trigger";
import { media } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Default travel in px for "up"/"down" when an element sets none (text ≈20; images smaller). */
  y?: number;
  stagger?: number;
  as?: ElementType;
  /** Passed through to the element (e.g. aria-label when rendering as <nav>). */
  "aria-label"?: string;
  id?: string;
}

/**
 * Scroll entrances, once per element, as descendants marked `data-reveal` (or the wrapper itself)
 * enter the viewport. The value picks the motion:
 *   ""/"up"     rise and fade (travel from `data-reveal-y`)    "down"   drop and fade
 *   "left"      slide in from the left                          "right"  slide in from the right
 *   "fade"      fade only                                       "scale"  settle from 96%
 *   "mask"      wipe open upward (clip-path)                     "mask-left" wipe open left → right
 * Elements already on screen when it sets up are left alone, so server-rendered content never flashes.
 * Reduced motion: nothing is hidden or animated.
 */
type Variant = "up" | "down" | "left" | "right" | "fade" | "scale" | "mask" | "mask-left";

const FROM: Record<Variant, (el: HTMLElement, y: number) => gsap.TweenVars> = {
  up: (el, y) => ({ autoAlpha: 0, y: Number(el.dataset.revealY ?? y) }),
  down: (el, y) => ({ autoAlpha: 0, y: -Number(el.dataset.revealY ?? y) }),
  left: (el) => ({ autoAlpha: 0, x: -Number(el.dataset.revealX ?? 48) }),
  right: (el) => ({ autoAlpha: 0, x: Number(el.dataset.revealX ?? 48) }),
  fade: () => ({ autoAlpha: 0 }),
  scale: () => ({ autoAlpha: 0, scale: 0.96, transformOrigin: "50% 60%" }),
  mask: () => ({ clipPath: "inset(100% 0% 0% 0%)" }),
  "mask-left": () => ({ clipPath: "inset(0% 100% 0% 0%)" }),
};

const TO: Record<Variant, gsap.TweenVars> = {
  up: { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" },
  down: { autoAlpha: 1, y: 0, duration: 0.6, ease: "power2.out" },
  left: { autoAlpha: 1, x: 0, duration: 0.8, ease: "power3.out" },
  right: { autoAlpha: 1, x: 0, duration: 0.8, ease: "power3.out" },
  fade: { autoAlpha: 1, duration: 0.9, ease: "power1.out" },
  scale: { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power3.out" },
  mask: { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power4.inOut" },
  "mask-left": { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: "power4.inOut" },
};

const variantOf = (el: HTMLElement): Variant => {
  const value = el.dataset.reveal as Variant | undefined;
  return value && value in FROM ? value : "up";
};

export function Reveal({ children, className, y = 20, stagger = 0.08, as: Tag = "div", ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      const root = ref.current;
      if (!root || !contextSafe) return;
      // Set up when the browser is idle rather than during hydration: measuring targets and creating
      // triggers stays out of the first long task.
      const setup = contextSafe(() => {
        const mm = gsap.matchMedia();
        mm.add(media.motionOK, () => {
          const marked = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
          const targets = (marked.length ? marked : [root]).filter(
            (el) => el.getBoundingClientRect().top > window.innerHeight * 0.95,
          );
          if (!targets.length) return;
          targets.forEach((el) => gsap.set(el, FROM[variantOf(el)](el, y)));
          ScrollTrigger.batch(targets, {
            start: "top 88%",
            once: true,
            onEnter: (batch) =>
              (batch as HTMLElement[]).forEach((el, index) =>
                gsap.to(el, { ...TO[variantOf(el)], delay: index * stagger, overwrite: true }),
              ),
          });
        });
      });
      if (typeof window.requestIdleCallback === "function") {
        const id = window.requestIdleCallback(setup, { timeout: 1500 });
        return () => window.cancelIdleCallback(id);
      }
      const id = setTimeout(setup, 200);
      return () => clearTimeout(id);
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
