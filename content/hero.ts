import { BRIEF_2, briefReview, meta } from "./meta";
import type { HeroSlide } from "./types";

const STOCK = "Supplied photograph that does not show Eko Club Louisiana; replace with club photography when available.";
const FOOTAGE =
  "Aerial Louisiana footage supplied 2026-10-15 (public/media/hero-video.mp4, 16.7 MB). Confirm its source and usage rights; a smaller muted encode plus WebM would load faster on phones.";

/** The three hero slides, in order. Copy from Prompt 2. */
export const heroSlides: HeroSlide[] = [
  {
    id: "legacy",
    tab: "Our mission",
    eyebrow: "Eko Club Louisiana",
    headline: "A shared legacy",
    text: "Advancing culture, education and humanitarian support in Louisiana and Lagos.",
    cta: { label: "Discover our mission", href: "/about#mission" },
    // Poster and fallback: the opening frame of the footage, so nothing jumps when playback starts.
    media: { asset: "heroVideoPoster" },
    video: [{ src: "/media/hero-video.mp4", type: "video/mp4" }],
    ...meta(BRIEF_2, briefReview(FOOTAGE)),
  },
  {
    id: "community",
    tab: "Our community",
    eyebrow: "Our community",
    headline: "Community in action",
    text: "Explore the people, gatherings and service that connect our community.",
    cta: { label: "Explore our community", href: "/gallery" },
    media: { asset: "communityDance" },
    video: [],
    ...meta(BRIEF_2, briefReview(STOCK)),
  },
  {
    id: "build",
    tab: "Get involved",
    eyebrow: "Get involved",
    headline: "Build with us",
    text: "Join, volunteer or support the work of Eko Club Louisiana.",
    cta: { label: "Get involved", href: "/get-involved" },
    media: { asset: "familyCelebration" },
    video: [],
    ...meta(BRIEF_2, briefReview(STOCK)),
  },
];
