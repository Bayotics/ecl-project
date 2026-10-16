// GSAP counterparts of the CSS motion tokens in styles/tokens.css.

export const ease = {
  /** --ease-out-expo */
  out: "expo.out",
  /** --ease-in-out */
  inOut: "power3.inOut",
  /** Wipes and panel exchanges */
  wipe: "expo.inOut",
  /** Exits */
  exit: "power2.in",
} as const;

export const duration = {
  fast: 0.24,
  base: 0.45,
  slow: 0.8,
  cinematic: 1.4,
} as const;

export const media = {
  reducedMotion: "(prefers-reduced-motion: reduce)",
  motionOK: "(prefers-reduced-motion: no-preference)",
  tablet: "(min-width: 768px)",
  desktop: "(min-width: 1024px)",
  finePointer: "(hover: hover) and (pointer: fine)",
} as const;

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(media.reducedMotion).matches;
}
