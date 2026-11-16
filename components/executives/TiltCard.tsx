"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

import styles from "./Executives.module.css";

/**
 * A portrait card that tips a few degrees towards the pointer, with a soft light following it.
 * Mouse and pen only (touch scrolls as normal); nothing moves when reduced motion is preferred.
 */
export function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const card = ref.current;
    if (!card || event.pointerType === "touch") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      card.style.setProperty("--rx", `${((0.5 - y) * 7).toFixed(2)}deg`);
      card.style.setProperty("--ry", `${((x - 0.5) * 9).toFixed(2)}deg`);
      card.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      card.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
      card.dataset.tilting = "";
    });
  };

  const onLeave = () => {
    const card = ref.current;
    if (!card) return;
    cancelAnimationFrame(frame.current);
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
    delete card.dataset.tilting;
  };

  return (
    <div ref={ref} className={className ? `${styles.tilt} ${className}` : styles.tilt} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </div>
  );
}
