// ScrollTrigger, registered on first import. Only scroll-revealed sections import this module.
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { gsap, scrollTriggerRef } from "./gsap";

gsap.registerPlugin(ScrollTrigger);
scrollTriggerRef.current = ScrollTrigger;

export { ScrollTrigger };
