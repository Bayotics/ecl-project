import { BRIEF_2, briefReview, meta } from "./meta";
import type { HeroSlide } from "./types";

const STOCK = "Supplied photograph that does not show Eko Club Louisiana; replace with club photography when available.";
const FOOTAGE =
  "Club footage supplied 2026-11-15 (public/media/homepage-hero.MOV, 4K, 40 s). Copies at 720p to 2160p are on R2 (scripts/upload-hero-video.mjs); the thumbnail shows while it loads.";

// The footage copies live on R2 (no file-size limit, free downloads), not in the repository.
const footage = `${(process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "")}/site-media/hero`;

/** The three hero slides, in order. Copy from Prompt 2. */
export const heroSlides: HeroSlide[] = [
  {
    id: "legacy",
    tab: "Our mission",
    eyebrow: "Eko Club Louisiana",
    headline: "A shared legacy",
    text: "Advancing culture and humanitarian support in Louisiana and Lagos.",
    cta: { label: "Discover our mission", href: "/about#mission" },
    // Shown until the footage is playing (and instead of it on data saver or if it fails).
    media: { asset: "homeHeroThumbnail" },
    // Each screen gets the smallest copy that is still sharp on it (see HeroVideo).
    video: [720, 1080, 1440, 2160].map((height) => ({ src: `${footage}/club-hero-${height}.mp4`, type: "video/mp4", height })),
    ...meta(BRIEF_2, briefReview(FOOTAGE)),
  },
  {
    id: "community",
    tab: "Our community",
    eyebrow: "Our community",
    headline: "Community in action",
    text: "Explore the people, gatherings and service that connect our community.",
    cta: { label: "Explore our community", href: "/gallery" },
    media: { asset: "homeCommunityInAction" },
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
    media: { asset: "homeBuildWithUs" },
    video: [],
    ...meta(BRIEF_2, briefReview(STOCK)),
  },
];
