import { gsap } from "@/lib/gsap";

/**
 * Header overlay choreography (docs/ui-spec.md D4).
 *
 * Open:  backdrop blur/dim 300ms · panel clip reveal 500ms power3.out · content rises 12px over 300ms,
 *        starting 120ms after the panel, staggered 35ms.
 * Close: content first, then the panel, then the backdrop.
 * Every tween animates *to* a state from wherever the element currently is, so killing an in-flight
 * timeline and starting a new one reverses or replaces it without a jump.
 */

const SHUT = "inset(0% 0% 100% 0%)";
const OPEN = "inset(0% 0% 0% 0%)";

const items = (panel: HTMLElement) => panel.querySelectorAll<HTMLElement>("[data-panel-item]");
const isShowing = (panel: HTMLElement) => getComputedStyle(panel).visibility !== "hidden";

interface OverlayMotion {
  /** Every overlay panel element. */
  panels: HTMLElement[];
  /** The panel to show, or null to close. */
  target: HTMLElement | null;
  backdrop: HTMLElement | null;
  reduced: boolean;
}

export function overlayTimeline({ panels, target, backdrop, reduced }: OverlayMotion): gsap.core.Timeline {
  const tl = gsap.timeline();
  const outgoing = panels.filter((panel) => panel !== target && isShowing(panel));

  if (!target) {
    outgoing.forEach((panel, index) => {
      const at = index === 0 ? 0 : "<";
      tl.to(items(panel), { opacity: 0, y: 12, duration: 0.18, ease: "power2.in", stagger: { each: 0.02, from: "end" } }, at)
        .to(panel, { clipPath: SHUT, duration: 0.38, ease: "power3.inOut" }, "-=0.06")
        .set(panel, { visibility: "hidden" });
    });
    if (backdrop) tl.to(backdrop, { autoAlpha: 0, duration: 0.28, ease: "power2.out" }, outgoing.length ? "-=0.2" : 0);
  } else {
    // Replace: retire whatever is showing quickly, keeping the backdrop up.
    outgoing.forEach((panel) => {
      tl.to(items(panel), { opacity: 0, duration: 0.12, ease: "power1.in" }, 0)
        .set(panel, { visibility: "hidden", clipPath: SHUT }, 0.12)
        .set(items(panel), { y: 12 }, 0.12);
    });
    if (backdrop) tl.to(backdrop, { autoAlpha: 1, duration: 0.3, ease: "power2.out" }, 0);

    // Visible (but still fully clipped) right away, so focus can move into it on open.
    gsap.set(target, { visibility: "visible" });
    const start = outgoing.length ? 0.12 : 0;
    tl.to(target, { clipPath: OPEN, duration: 0.5, ease: "power3.out" }, start)
      .to(items(target), { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", stagger: 0.035 }, start + 0.12);
  }

  if (reduced) tl.progress(1);
  return tl;
}

/** Slide between mobile drill-down levels (root ⇄ nested). */
export function levelTimeline(track: HTMLElement, index: number, reduced: boolean): gsap.core.Tween {
  return gsap.to(track, { xPercent: -100 * index, duration: reduced ? 0 : 0.45, ease: "power3.out" });
}
