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

/** The five mission areas used by the carousel, menus, panels, detail pages and search. */
export const causes: Cause[] = [
  cause("youth-outreach", "01", "Youth Outreach", "Encouraging the next generation", { asset: "homeYouthOutreach" }, [
    "Youth outreach is about the next generation: giving young people of Lagos heritage in Louisiana a place to belong, to learn from those who came before them and to lead in their own right.",
  ]),
  cause("cultural-heritage", "02", "Cultural Heritage", "Keeping our traditions connected", { asset: "homeCulturalHeritage" }, [
    "Cultural heritage is about keeping traditions connected. The language, dress, music and celebrations of Lagos are part of who we are, and the club is a place to keep them alive and pass them on.",
  ]),
  cause("humanitarian-support", "03", "Humanitarian Support", "Bringing people together in service", { asset: "homeHumanitarianSupport" }, [
    "Humanitarian support is about bringing people together in service, and helping where help is needed, in Louisiana and in Lagos.",
  ]),
  cause("community-building", "04", "Community Building", "Strengthening fellowship and belonging", { asset: "homeCommunityBuilding" }, [
    "Community building is about fellowship and belonging. The club brings the sons, daughters and friends of Lagos together, so that no one has to make a home in Louisiana alone.",
  ]),
  cause("health-and-wellbeing", "05", "Health and Wellbeing", "Supporting healthier communities", { asset: "homeHealthAndWellbeing" }, [
    "Health and wellbeing is about supporting healthier communities, and looking after one another in body and mind.",
  ]),
];

export function getCause(slug: string): Cause | undefined {
  return causes.find((item) => item.slug === slug);
}

/** Mission areas live under /programs (Prompt 9); /causes redirects there. */
export const causeHref = (slug: string) => `/programs/${slug}`;
