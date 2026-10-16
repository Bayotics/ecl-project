"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

import styles from "./RouteTransition.module.css";

/**
 * Page-change reveal: the intro loader's three curtains, without the mark or the charcoal. When the
 * route changes, three light panels cover the new page before it paints, then lift left → middle →
 * right to reveal it. Never on the first load (the intro loader handles that), never under reduced
 * motion, and it never intercepts clicks.
 */
export function RouteTransition() {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  // Initialised to the first path, so the first load (and Strict Mode's re-run) does nothing.
  const previous = useRef(pathname);

  useLayoutEffect(() => {
    if (previous.current === pathname) return;
    previous.current = pathname;
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const curtains = root.querySelectorAll<HTMLElement>("[data-route-curtain]");
    gsap.killTweensOf(curtains);
    // Cover synchronously, before the browser paints the new page.
    gsap.set(root, { visibility: "visible" });
    gsap.set(curtains, { yPercent: 0 });
    const timeline = gsap.timeline({ onComplete: () => gsap.set(root, { visibility: "hidden" }) });
    timeline.to(curtains, { yPercent: -100, duration: 0.75, ease: "power3.inOut", stagger: 0.08, delay: 0.05 });

    return () => {
      timeline.kill();
      gsap.set(root, { visibility: "hidden" });
    };
  }, [pathname]);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <div className={`${styles.curtain} ${styles.left}`} data-route-curtain />
      <div className={`${styles.curtain} ${styles.middle}`} data-route-curtain />
      <div className={`${styles.curtain} ${styles.right}`} data-route-curtain />
    </div>
  );
}
