import { BRIEF_2, briefReview, meta } from "./meta";
import type { Cause, MediaRef } from "./types";

const NO_PROGRAMS = "Mission area only: do not attach named programs, projects or outcomes until the club supplies them.";
const STAND_IN = "Card image is a supplied photograph that does not show Eko Club Louisiana; replace with a club photograph of this area when available.";

const EXPLANATION = "The explanation paragraph is an editorial draft; confirm the wording with the club.";

const cause = (slug: string, number: string, title: string, short: string, media: MediaRef, body: string[]): Cause => ({
  slug,
  number,
  title,
  short,
  body,
  media,
  ...meta(BRIEF_2, briefReview(NO_PROGRAMS, STAND_IN, EXPLANATION)),
});

/** The six mission areas used by the carousel, menus, panels, detail pages and search. */
export const causes: Cause[] = [
  cause("education", "01", "Education", "Supporting learning and opportunity", { asset: "eldersGathering" }, [
    "Education is about learning and opportunity. For a community with roots in Lagos and a home in Louisiana, it means encouraging study, sharing knowledge across generations and helping one another find the way forward.",
  ]),
  cause("youth-leadership", "02", "Youth Leadership", "Encouraging the next generation", { asset: "homeYouthLeadership" }, [
    "Youth leadership is about the next generation: giving young people of Lagos heritage in Louisiana a place to belong, to learn from those who came before them and to lead in their own right.",
  ]),
  cause("cultural-heritage", "03", "Cultural Heritage", "Keeping our traditions connected", { asset: "homeCulturalHeritage" }, [
    "Cultural heritage is about keeping traditions connected. The language, dress, music and celebrations of Lagos are part of who we are, and the club is a place to keep them alive and pass them on.",
  ]),
  cause("humanitarian-support", "04", "Humanitarian Support", "Bringing people together in service", { asset: "homeHumanitarianSupport" }, [
    "Humanitarian support is about bringing people together in service, and helping where help is needed, in Louisiana and in Lagos.",
  ]),
  cause("community-building", "05", "Community Building", "Strengthening fellowship and belonging", { asset: "homeCommunityBuilding" }, [
    "Community building is about fellowship and belonging. The club brings the sons, daughters and friends of Lagos together, so that no one has to make a home in Louisiana alone.",
  ]),
  cause("health-and-wellbeing", "06", "Health and Wellbeing", "Supporting healthier communities", { asset: "homeHealthAndWellbeing" }, [
    "Health and wellbeing is about supporting healthier communities, and looking after one another in body and mind.",
  ]),
];

export function getCause(slug: string): Cause | undefined {
  return causes.find((item) => item.slug === slug);
}

/** Mission areas live under /programs (Prompt 9); /causes redirects there. */
export const causeHref = (slug: string) => `/programs/${slug}`;
