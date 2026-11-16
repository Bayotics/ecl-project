/**
 * Media manifest (docs/media-manifest.md). Records point at these assets through `MediaRef`s, which
 * carry their own crop focus and zoom. Club photographs are described as the club; supplied stock and
 * Lagos photographs are described neutrally and never as Eko Club Louisiana members or events.
 */
import asoOkeCouple from "@/assets/media/homepage/programs-dropdown.png";
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
import homeCommunityInAction from "@/assets/media/homepage/community-in-action-slide.jpg";
import homeBuildWithUs from "@/assets/media/homepage/build-with-us-slide.jpg";
import homePresidentMessage from "@/assets/media/homepage/message-from-president.webp";
import homeImpact from "@/assets/media/homepage/impact-card.png";
import homeCauses from "@/assets/media/homepage/causes-card.png";
import homeYouthOutreach from "@/assets/media/homepage/youth-outreach.jpg";
import homeHeroThumbnail from "@/assets/media/homepage/hero-thumbnail.jpg";
import historyLagosIsland from "@/assets/media/history/lagos-island.jpg";
import historyDawodu from "@/assets/media/history/olusesi-dawodu.jpg";
import historyKeynotePoster from "@/assets/media/history/keynote-poster.jpg";
import homeCulturalHeritage from "@/assets/media/homepage/cultural-heritage.png";
import homeHumanitarianSupport from "@/assets/media/homepage/humanitarian-support.png";
import homeCommunityBuilding from "@/assets/media/homepage/community-building.png";
import homeHealthAndWellbeing from "@/assets/media/homepage/health-and-wellbeing.jpg";
import homeRootedInLagos from "@/assets/media/homepage/rooted-in-lagos.png";
import homeCommunityBuiltTogether from "@/assets/media/homepage/community-built-together.png";
import aboutUsDropdown from "@/assets/media/homepage/about-us-dropdown.png";
import youthHeroBanner from "@/assets/media/programs/youth-outreach/hero-banner.jpg";
import youthPlaceToBelong from "@/assets/media/programs/youth-outreach/place-to-belong.png";
import youthMoment1 from "@/assets/media/programs/youth-outreach/youth-moment-1.png";
import youthMoment2 from "@/assets/media/programs/youth-outreach/youth-moment-2.png";
import youthMoment3 from "@/assets/media/programs/youth-outreach/youth-moment-3.png";
import youthMoment4 from "@/assets/media/programs/youth-outreach/youth-moment-4.png";
import youthMoment5 from "@/assets/media/programs/youth-outreach/youth-moment-5.png";
import heritageHeroBanner from "@/assets/media/programs/cultural-heritage/hero-banner.jpg";
import heritageTradAttire from "@/assets/media/programs/cultural-heritage/trad-attire.png";
import heritageDrummers from "@/assets/media/programs/cultural-heritage/drummers-or-musicians.png";
import heritageDance from "@/assets/media/programs/cultural-heritage/dance.png";
import heritageFestival from "@/assets/media/programs/cultural-heritage/festival-or-parade.png";
import heritageFamily from "@/assets/media/programs/cultural-heritage/fam-in-trad-dress.webp";
import heritageCelebration from "@/assets/media/programs/cultural-heritage/celebration-in-detail.png";
import heritagePortrait from "@/assets/media/programs/cultural-heritage/portrait-in-trad-dress.jpg";
import heritageEldersYoung from "@/assets/media/programs/cultural-heritage/elders-and-young-people.png";
import humanitarianHero from "@/assets/media/programs/humanitarian-support/volunteers-together.jpg";
import humanitarianManyHands from "@/assets/media/programs/humanitarian-support/preparing-donations.jpg";
import humanitarianSorting from "@/assets/media/programs/humanitarian-support/sorting-donations.jpg";
import humanitarianTeam from "@/assets/media/programs/humanitarian-support/volunteers-team.jpg";
import humanitarianGiving from "@/assets/media/programs/humanitarian-support/giving-out-supplies.jpg";
import humanitarianOutreach from "@/assets/media/programs/humanitarian-support/community-outreach.jpg";
import communityHero from "@/assets/media/programs/community-building/members-together.jpg";
import communityLeanOn from "@/assets/media/programs/community-building/members-laughing.jpg";
import communityQuote from "@/assets/media/programs/community-building/celebration-moment.jpg";
import communityGroup from "@/assets/media/programs/community-building/group-photo.jpg";
import communityGreeting from "@/assets/media/programs/community-building/friends-greeting.jpg";
import communityCouple from "@/assets/media/programs/community-building/couple-at-table.jpg";
import communityOutreach1 from "@/assets/media/programs/community-building/outreach-gathering.jpg";
import communityOutreach2 from "@/assets/media/programs/community-building/outreach-together.jpg";
import healthHero from "@/assets/media/programs/health-and-wellbeing/outreach-team.jpg";
import healthCare from "@/assets/media/programs/health-and-wellbeing/personal-care-supplies.jpg";
import healthElder from "@/assets/media/programs/health-and-wellbeing/elder-with-donations.jpg";
import healthGroup from "@/assets/media/programs/health-and-wellbeing/outreach-group.jpg";

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


/** Homepage photographs supplied by the club on 2026-11-14 (originals copied unchanged into assets/media/homepage; the .CR2 as its full-size embedded camera JPEG). */
const homepage = (id: AssetId, src: MediaAsset["src"], file: string, original: [number, number], alt: string, focal: MediaAsset["focal"]): MediaAsset => ({
  id,
  kind: "photo",
  src,
  alt,
  focal,
  credit: null,
  original: { file: `public/media/homepage/${file}`, width: original[0], height: original[1] },
  status: "published",
  provenance: { source: "club-supplied", retrieved: "2026-11-14", note: "Supplied for the homepage in public/media/homepage." },
  review: { verified: true, notes: [] },
});


/** Program page photographs supplied by the club, copied unchanged (the .CR2 as its embedded camera JPEG). */
const programPhoto = (id: AssetId, src: MediaAsset["src"], folder: string, file: string, original: [number, number], alt: string): MediaAsset => ({
  id,
  kind: "photo",
  src,
  alt,
  focal: { x: 50, y: 45 },
  credit: null,
  original: { file: `public/media/${folder}/${file}`, width: original[0], height: original[1] },
  status: "published",
  provenance: { source: "club-supplied", retrieved: "2026-11-15", note: `Supplied for the program pages in public/media/${folder}.` },
  review: { verified: true, notes: [] },
});

/** History page photographs supplied by the club on 2026-11-16 (copied unchanged into assets/media/history). */
const historyPhoto = (id: AssetId, src: MediaAsset["src"], file: string, original: [number, number], alt: string, focal: MediaAsset["focal"]): MediaAsset => ({
  id,
  kind: "photo",
  src,
  alt,
  focal,
  credit: null,
  original: { file: `public/media/history/${file}`, width: original[0], height: original[1] },
  status: "published",
  provenance: { source: "club-supplied", retrieved: "2026-11-16", note: "Supplied for the History page in public/media/history." },
  review: { verified: true, notes: [] },
});

const STOCK = "Unsplash photograph supplied with the new media. It does not show Eko Club Louisiana members; replace with club photography when available and keep the photographer credit.";
const LAGOS = "Lagos street-festival photograph supplied with the new media. Confirm the photographer and usage rights.";

export const assets: Record<AssetId, MediaAsset> = {
  // Homepage hero: shown while the footage loads (web copy at 3000 px, JPEG quality 90).
  homeHeroThumbnail: {
    ...homepage("homeHeroThumbnail", homeHeroThumbnail, "hero-thumbnail.jpg", [5760, 3840], "Club members in royal-blue and white traditional attire posing together for a group photograph.", { x: 50, y: 35 }),
    original: { file: "public/media/hero-thumbnail.jpg", width: 5760, height: 3840 },
  },
  // Health and Wellbeing photos: web copies at 3000 px, JPEG quality 90 (no visible difference from the originals).
  // Wide opening strip: frame low enough to keep heads and the donations in view.
  historyLagosIsland: historyPhoto("historyLagosIsland", historyLagosIsland, "lagos-island.jpeg", [2048, 1366], "Lagos Island from above: office towers and a cathedral clock tower beside the lagoon, with the bridge to the mainland.", { x: 64, y: 50 }),
  historyDawodu: historyPhoto("historyDawodu", historyDawodu, "Late-dawodu1.jpg", [230, 285], "Portrait of the late Olusesi Dawodu in a pinstripe suit and patterned tie.", { x: 50, y: 30 }),
  historyKeynotePoster: historyPhoto("historyKeynotePoster", historyKeynotePoster, "videoplayback (1).mp4", [480, 360], "The keynote speaker at a lectern beside the Nigerian flag, at the 6th International Convention of Eko Club International in 2009.", { x: 50, y: 40 }),
  healthHero: { ...programPhoto("healthHero", healthHero, "health-and-wellbeing", "IMG_5044.jpeg", [4032, 3024], "Members in club T-shirts with an elder, hands on donated food and supplies under an Eko Club Louisiana charity outreach banner."), focal: { x: 50, y: 55 } },
  healthCare: programPhoto("healthCare", healthCare, "health-and-wellbeing", "IMG_5628.CR2", [6000, 4000], "Members in club shirts gathered around a table of personal-care and hygiene supplies."),
  healthElder: programPhoto("healthElder", healthElder, "health-and-wellbeing", "IMG_5041.jpeg", [4032, 3024], "An elder in traditional attire standing beside donated food at the charity outreach."),
  healthGroup: programPhoto("healthGroup", healthGroup, "health-and-wellbeing", "IMG_5042.jpeg", [4032, 3024], "Members and an elder standing together behind donated food and supplies."),
  // Community Building photos: web copies at 3000 px, JPEG quality 90 (no visible difference from the originals).
  // Full-screen opening: frame from near the top so heads are not cut off.
  communityHero: { ...programPhoto("communityHero", communityHero, "Community-building", "IMG_5557.jpg", [6000, 4000], "A large group of members in colourful attire smiling together."), focal: { x: 50, y: 12 } },
  communityLeanOn: programPhoto("communityLeanOn", communityLeanOn, "Community-building", "IMG_5559.jpg", [6000, 4000], "Members laughing together at a club gathering."),
  communityQuote: programPhoto("communityQuote", communityQuote, "Community-building", "IMG_5545.jpg", [6000, 4000], "A woman holding a hand fan among members at a street celebration."),
  communityGroup: programPhoto("communityGroup", communityGroup, "Community-building", "DW3A0330.jpg", [5760, 3840], "Three men in white traditional attire and blue caps standing together."),
  communityGreeting: programPhoto("communityGreeting", communityGreeting, "Community-building", "IMG_5475.jpg", [6000, 4000], "Two women smiling as they hold up a white handkerchief."),
  communityCouple: programPhoto("communityCouple", communityCouple, "Community-building", "DW3A0432.jpg", [5760, 3840], "A couple in traditional attire seated together at a celebration table."),
  communityOutreach1: programPhoto("communityOutreach1", communityOutreach1, "Community-building", "IMG_5633.jpg", [6000, 4000], "Members and neighbours gathered at a community outreach."),
  communityOutreach2: programPhoto("communityOutreach2", communityOutreach2, "Community-building", "IMG_5634.jpg", [6000, 4000], "Members talking together at a community outreach."),
  // Humanitarian Support photos: web copies at 3000 px, JPEG quality 90, made from the camera JPEG inside
  // each .CR2 (about a third of the original size; no visible difference). Other program photos are exact copies.
  humanitarianHero: programPhoto("humanitarianHero", humanitarianHero, "Youth-Outreach", "IMG_5617.CR2", [6000, 4000], "A large group of volunteers in club shirts behind tables of donated supplies."),
  humanitarianManyHands: programPhoto("humanitarianManyHands", humanitarianManyHands, "Youth-Outreach", "IMG_5602.CR2", [6000, 4000], "Club members smiling together beside a box and bags of donations."),
  humanitarianSorting: programPhoto("humanitarianSorting", humanitarianSorting, "Youth-Outreach", "IMG_5608.CR2", [6000, 4000], "Club members standing beside bags of donated clothing."),
  humanitarianTeam: programPhoto("humanitarianTeam", humanitarianTeam, "Youth-Outreach", "IMG_5605.CR2", [6000, 4000], "Volunteers in club shirts posing together for a team photo."),
  humanitarianGiving: programPhoto("humanitarianGiving", humanitarianGiving, "Youth-Outreach", "IMG_5629.CR2", [6000, 4000], "Volunteers handing out personal-care supplies from a table."),
  humanitarianOutreach: programPhoto("humanitarianOutreach", humanitarianOutreach, "Youth-Outreach", "IMG_5620.CR2", [6000, 4000], "Community members, including an older man with a walker, gathered at the outreach."),
  // Web copy: 3000 px wide, JPEG quality 90 (no visible difference; a fraction of the original size).
  heritageHeroBanner: programPhoto("heritageHeroBanner", heritageHeroBanner, "Cultural-heritage", "hero-banner.jpg", [5760, 3840], "Members in royal-blue attire and gele head wraps gathered for a group photograph in a hall."),
  heritageTradAttire: programPhoto("heritageTradAttire", heritageTradAttire, "Cultural-heritage", "trad-attire.png", [841, 626], "Two men in white traditional attire and blue caps, one wearing coral beads."),
  heritageDrummers: programPhoto("heritageDrummers", heritageDrummers, "Cultural-heritage", "drummers-or-musicians.png", [968, 640], "A brass band and a costumed masquerade performer at a celebration."),
  heritageDance: programPhoto("heritageDance", heritageDance, "Cultural-heritage", "dance.png", [939, 631], "Women in blue and gold traditional attire dancing with hand fans."),
  heritageFestival: programPhoto("heritageFestival", heritageFestival, "Cultural-heritage", "festival-or-parade.png", [950, 636], "Members in traditional prints holding up white handkerchiefs at a street celebration."),
  heritageFamily: programPhoto("heritageFamily", heritageFamily, "Cultural-heritage", "fam-in-trad-dress.webp", [991, 606], "Members in white attire and gold-trimmed stoles standing together in front of a stage."),
  heritageCelebration: programPhoto("heritageCelebration", heritageCelebration, "Cultural-heritage", "celebration-in-detail.png", [960, 634], "A brass player, a smiling woman and a feathered masquerade performer at a celebration."),
  heritagePortrait: programPhoto("heritagePortrait", heritagePortrait, "Cultural-heritage", "portrait-in-trad-dress.jpg", [2048, 1365], "A white-robed Eyo masquerade figure in a wide-brimmed hat on a parade float."),
  heritageEldersYoung: programPhoto("heritageEldersYoung", heritageEldersYoung, "Cultural-heritage", "elders-and-young-people.png", [953, 635], "Members in traditional attire seated together at a club gathering."),
  // Web copy: 3000 px wide, JPEG quality 90 (no visible difference; a fraction of the original size).
  youthHeroBanner: programPhoto("youthHeroBanner", youthHeroBanner, "Youth-Leadership", "youth-leadership-hero-banner.CR2", [6000, 4000], "Young members in matching club shirts standing behind a table of donated supplies."),
  youthPlaceToBelong: programPhoto("youthPlaceToBelong", youthPlaceToBelong, "Youth-Leadership", "place-to-belong.png", [964, 633], "Young members in matching club shirts standing together."),
  youthMoment1: programPhoto("youthMoment1", youthMoment1, "Youth-Leadership", "youth-moment-1.png", [834, 624], "Young members and volunteers gathered around a table of donated supplies."),
  youthMoment2: programPhoto("youthMoment2", youthMoment2, "Youth-Leadership", "youth-moment-2.png", [954, 631], "A young drummer marching with musicians in a street parade."),
  youthMoment3: programPhoto("youthMoment3", youthMoment3, "Youth-Leadership", "youth-moment-3.png", [947, 593], "Young volunteers sorting donated personal-care supplies."),
  youthMoment4: programPhoto("youthMoment4", youthMoment4, "Youth-Leadership", "youth-moment-4.png", [969, 622], "Young people with family and friends at a club gathering."),
  youthMoment5: programPhoto("youthMoment5", youthMoment5, "Youth-Leadership", "youth-moment-5.png", [627, 622], "Club members smiling together in matching shirts."),
  aboutUsDropdown: homepage("aboutUsDropdown", aboutUsDropdown, "about-us-dropdown.png", [965, 624], "Eko Club Louisiana members gathered together.", { x: 50, y: 50 }),
  homeCommunityInAction: homepage("homeCommunityInAction", homeCommunityInAction, "community-in-action-slide.jpg", [6000, 4000], "Women in colourful traditional attire and gele head wraps walking together along a city street.", { x: 50, y: 50 }),
  homeBuildWithUs: homepage("homeBuildWithUs", homeBuildWithUs, "build-with-us-slide.CR2", [6000, 4000], "Volunteers in matching red-and-white shirts gathered behind a table of donated personal-care supplies.", { x: 50, y: 45 }),
  homePresidentMessage: homepage("homePresidentMessage", homePresidentMessage, "message-from-president-thuimbnail.webp", [525, 685], "Portrait of a man in a cream agbada and an embroidered gold cap.", { x: 50, y: 35 }),
  homeImpact: homepage("homeImpact", homeImpact, "impact-card.png", [966, 638], "Women in matching royal-blue lace attire and gele head wraps standing together in a school hall.", { x: 50, y: 50 }),
  homeCauses: homepage("homeCauses", homeCauses, "causes-card.png", [961, 638], "Two club members wearing green Eko Club stoles and blue head ties.", { x: 50, y: 40 }),
  homeYouthOutreach: homepage("homeYouthOutreach", homeYouthOutreach, "youth-outreach-card.jpg", [6020, 4015], "Young people in matching red-and-white shirts gathered around a table of donated supplies.", { x: 50, y: 45 }),
  homeCulturalHeritage: homepage("homeCulturalHeritage", homeCulturalHeritage, "cultural-heritage.png", [804, 633], "Two men in white traditional attire and blue caps, one wearing coral beads, in front of a balloon backdrop.", { x: 50, y: 40 }),
  homeHumanitarianSupport: homepage("homeHumanitarianSupport", homeHumanitarianSupport, "humanitarian-support.png", [964, 641], "Volunteers in red-and-white shirts sorting donated personal-care products.", { x: 50, y: 50 }),
  homeCommunityBuilding: homepage("homeCommunityBuilding", homeCommunityBuilding, "community-building.png", [893, 638], "A smiling woman and man in white Eko Club polo shirts at a club gathering.", { x: 50, y: 40 }),
  homeHealthAndWellbeing: homepage("homeHealthAndWellbeing", homeHealthAndWellbeing, "health-and-wellbeing.JPG", [933, 1290], "A health worker in gloves and a mask taking a nasal swab from a seated man.", { x: 50, y: 45 }),
  homeRootedInLagos: homepage("homeRootedInLagos", homeRootedInLagos, "rooted-in-lagos.png", [960, 636], "A colourful masquerade figure leading a street procession of people in traditional attire.", { x: 50, y: 45 }),
  homeCommunityBuiltTogether: homepage("homeCommunityBuiltTogether", homeCommunityBuiltTogether, "community-built-together.png", [920, 635], "Club members in white attire and black-and-gold Eko Club stoles standing together.", { x: 50, y: 40 }),
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
  // Programs dropdown photo (the id is kept from the stock image it replaced).
  asoOkeCouple: homepage("asoOkeCouple", asoOkeCouple, "programs-dropdown.png", [953, 635], "ECL Members at oldies night.", { x: 50, y: 40 }),
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
