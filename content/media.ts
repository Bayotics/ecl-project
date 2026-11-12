/**
 * Media manifest (docs/media-manifest.md). Records point at these assets through `MediaRef`s, which
 * carry their own crop focus and zoom. Club photographs are described as the club; supplied stock and
 * Lagos photographs are described neutrally and never as Eko Club Louisiana members or events.
 */
import asoOkeCouple from "@/assets/media/aso-oke-couple.jpg";
import celebrationGuests from "@/assets/media/celebration-guests.jpg";
import communityDance from "@/assets/media/community-dance.jpg";
import crest from "@/assets/media/ecl-crest.png";
import group2018 from "@/assets/media/ecl-group-2018.jpg";
import eldersGathering from "@/assets/media/elders-gathering.jpg";
import familyCelebration from "@/assets/media/family-celebration.jpg";
import greetingCelebration from "@/assets/media/greeting-celebration.jpg";
import heroVideoPoster from "@/assets/media/hero-video-poster.jpg";
import lagosCarnival from "@/assets/media/lagos-carnival.jpg";
import lagosEyoFloat from "@/assets/media/lagos-eyo-float.jpg";

import type { AssetId, MediaAsset, MediaRef, ResolvedMedia } from "./types";

const RETRIEVED = "2026-10-14";


/** Photographs supplied by the club on 2026-10-15 (assets/source/new-media). */
const SUPPLIED = "2026-10-15";
const supplied = (
  id: AssetId,
  src: MediaAsset["src"],
  file: string,
  original: [number, number],
  alt: string,
  focal: MediaAsset["focal"],
  credit: string | null,
  notes: string[],
): MediaAsset => ({
  id,
  kind: "photo",
  src,
  alt,
  focal,
  credit,
  original: { file: `assets/source/new-media/${file}`, width: original[0], height: original[1] },
  status: "published",
  provenance: { source: "club-supplied", retrieved: SUPPLIED, note: "Supplied with the hero video in the new-media folder." },
  review: { verified: false, notes },
});

const STOCK = "Unsplash photograph supplied with the new media. It does not show Eko Club Louisiana members; replace with club photography when available and keep the photographer credit.";
const LAGOS = "Lagos street-festival photograph supplied with the new media. Confirm the photographer and usage rights.";

export const assets: Record<AssetId, MediaAsset> = {
  eclGroup2018: {
    id: "eclGroup2018",
    kind: "photo",
    src: group2018,
    alt: "Eko Club Louisiana members in white attire and gold-trimmed Eko Louisiana stoles, standing together in front of a stage with an Eko Club Louisiana banner.",
    focal: { x: 50, y: 58 },
    credit: "Zion Photography",
    original: { file: "assets/source/group-pic.png", width: 991, height: 606 },
    status: "published",
    provenance: {
      source: "ekoclublouisiana.org",
      url: "https://ekoclublouisiana.org/wp-content/uploads/2021/08/group-pic.png",
      retrieved: RETRIEVED,
      note: "Homepage group photograph on the existing site.",
    },
    review: {
      verified: false,
      notes: [
        "Low resolution (991×606 source, 979×606 after trimming its dark edge border). It is upscaled in the hero and other wide placements; request the photographer's original.",
        "Carries a 'Zion Photography' watermark (lower left). Confirm usage rights and credit with the photographer.",
        "The stage banner reads 'Eko Club Louisiana … Inauguration and ECI Quarterly Meeting, December … 2018'. The day is not legible.",
        "This single photograph currently stands in for every image placement; see `outstandingMedia`.",
      ],
    },
  },
  eclCrest: {
    id: "eclCrest",
    kind: "logo",
    src: crest,
    alt: "Eko Club Louisiana crest",
    focal: { x: 50, y: 50 },
    credit: null,
    original: { file: "assets/source/eko-logob.png", width: 238, height: 239 },
    status: "published",
    provenance: {
      source: "ekoclublouisiana.org",
      url: "https://ekoclublouisiana.org/wp-content/uploads/2021/04/eko-logob.png",
      retrieved: RETRIEVED,
    },
    review: {
      verified: false,
      notes: ["Only a 238px raster is available. Request a vector (SVG/PDF) master for crisp large use."],
    },
  },
  heroVideoPoster: supplied(
    "heroVideoPoster",
    heroVideoPoster,
    "hero-video.mp4",
    [1280, 720],
    "Aerial view over a Louisiana city centre, the opening frame of the hero video.",
    { x: 50, y: 50 },
    null,
    ["Opening frame of hero-video.mp4, extracted for the poster and fallback. Confirm the footage's source and usage rights."],
  ),
  lagosEyoFloat: supplied(
    "lagosEyoFloat",
    lagosEyoFloat,
    "eko-2.jpeg",
    [2048, 1365],
    "A parade float of a white-robed Eyo masquerade figure in a wide-brimmed hat moving along a Lagos street, with a double-decker tour bus behind.",
    { x: 56, y: 50 },
    null,
    [LAGOS],
  ),
  lagosCarnival: supplied(
    "lagosCarnival",
    lagosCarnival,
    "eko-3.jpeg",
    [2048, 1365],
    "Carnival participants in green-and-white costumes and feathered headdresses gathered on a Lagos street.",
    { x: 52, y: 48 },
    null,
    [LAGOS],
  ),
  eldersGathering: supplied(
    "eldersGathering",
    eldersGathering,
    "bunting-kargbo-QNYFV2smeps-unsplash.jpg",
    [2940, 1960],
    "Elders in caps and flowing robes seated at a ceremony, one reading from a sheet of paper beside a microphone.",
    { x: 62, y: 42 },
    "Bunting Kargbo / Unsplash",
    [STOCK],
  ),
  celebrationGuests: supplied(
    "celebrationGuests",
    celebrationGuests,
    "jim-nyamao-2_D8oTC10Sk-unsplash.jpg",
    [5472, 3648],
    "Three women in bright pink and floral dresses clapping and smiling at an outdoor celebration under string lights.",
    { x: 52, y: 34 },
    "Jim Nyamao / Unsplash",
    [STOCK],
  ),
  asoOkeCouple: supplied(
    "asoOkeCouple",
    asoOkeCouple,
    "samson-ejim-olzRU-XchJ4-unsplash.jpg",
    [3748, 2464],
    "A smiling couple in matching purple aso-oke, gele and coral beads at a traditional celebration, with a drummer behind them.",
    { x: 50, y: 36 },
    "Samson Ejim / Unsplash",
    [STOCK],
  ),
  communityDance: supplied(
    "communityDance",
    communityDance,
    "steward-masweneng-yNA0ZDdFS1I-unsplash.jpg",
    [4928, 2772],
    "Guests dancing and laughing together at an outdoor community gathering.",
    { x: 52, y: 42 },
    "Steward Masweneng / Unsplash",
    [STOCK],
  ),
  familyCelebration: supplied(
    "familyCelebration",
    familyCelebration,
    "temitayo-olatoke-2Nejjh9TFCk-unsplash.jpg",
    [6016, 4016],
    "A family in coordinated pink lace and gold attire with matching gele and fila, smiling together in a decorated hall.",
    { x: 44, y: 34 },
    "Temitayo Olatoke / Unsplash",
    [STOCK],
  ),
  greetingCelebration: supplied(
    "greetingCelebration",
    greetingCelebration,
    "temitayo-olatoke-XikXA72vWGw-unsplash.jpg",
    [6016, 4016],
    "A smiling man in a red fila greeting guests in gele and coral beads at a celebration.",
    { x: 56, y: 32 },
    "Temitayo Olatoke / Unsplash",
    [STOCK],
  ),
};

/** Moving-media and photography the design calls for but the club has not supplied yet. */
export const outstandingMedia: Array<{ placement: string; need: string }> = [
  {
    placement: "Culture feature video",
    need: "Landscape 16:9 loop of club cultural activity, about 10–20s, muted, MP4/H.264 + WebM, ≤ 8 MB. Until then the Lagos Eyo float photograph is shown.",
  },
  {
    placement: "Hero video (smaller encodes)",
    need: "hero-video.mp4 is 16.7 MB (1280×720 H.264, 24.6s, with an unused audio track). A muted ≤ 6 MB encode, plus a WebM version, would load much faster on phones.",
  },
  {
    placement: "Club photography",
    need: "Photographs of Eko Club Louisiana's own members and events. The supplied Unsplash photographs show other celebrations and should be replaced over time.",
  },
  {
    placement: "Group photograph master",
    need: "The original high-resolution file of the 2018 group photograph, without watermark if licensed.",
  },
];

export function resolveMedia(ref: MediaRef): ResolvedMedia {
  const asset = assets[ref.asset];
  const focal = ref.focal ?? asset.focal;
  return {
    src: ref.remote ?? asset.src,
    alt: ref.alt ?? asset.alt,
    kind: ref.remote ? "photo" : asset.kind,
    fit: ref.fit ?? (ref.remote ? "cover" : asset.kind === "logo" ? "contain" : "cover"),
    position: `${focal.x}% ${focal.y}%`,
    zoom: ref.zoom ?? 1,
  };
}

/** Shared references used across records. */
export const media = {
  groupFull: { asset: "eclGroup2018" } satisfies MediaRef,
  crest: { asset: "eclCrest", fit: "contain" } satisfies MediaRef,
};
