import { DRAFT, draftReview, meta } from "./meta";
import type { NewsItem } from "./types";

/**
 * Club updates. Publish an item only with a confirmed day-precision date, e.g.
 * `date: { value: "2026-11-02", precision: "day" }`, and `status: "published"`.
 */
export const news: NewsItem[] = [
  {
    kind: "news",
    slug: "new-website",
    title: "A new website for Eko Club Louisiana",
    excerpt: "Our mission, causes, community and contact details, together in one place.",
    body: [
      "Eko Club Louisiana has a new website. It brings together the club's mission, its six areas of focus, events, photographs and ways to take part, and it works on phones as well as computers.",
    ],
    // Set to the launch date when the site goes live.
    date: null,
    media: {
      asset: "eclGroup2018",
      focal: { x: 72, y: 52 },
      zoom: 1.8,
      alt: "Eko Club Louisiana members in white attire and Eko Louisiana stoles.",
    },
    // Draft: not club-approved news. Publish (with its date) only when the club approves it at launch.
    ...meta(DRAFT, draftReview("Set the date to the launch day and publish only with club approval."), "draft"),
  },
];
