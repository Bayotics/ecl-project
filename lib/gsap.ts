// Single registration point for GSAP. Import gsap from here in client components only.
// ScrollTrigger lives in lib/scroll-trigger.ts so pages without scroll reveals never load it.
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import type { ScrollTrigger as ScrollTriggerType } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP);

/** Set once ScrollTrigger has loaded (lib/scroll-trigger.ts); smooth scrolling keeps it in sync. */
export const scrollTriggerRef: { current: typeof ScrollTriggerType | null } = { current: null };

export { gsap, useGSAP };
