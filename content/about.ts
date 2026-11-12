import { causeHref, causes } from "./causes";
import { DRAFT, draftReview, meta, published } from "./meta";
import { resolveMedia } from "./media";
import type { LinkItem, VideoSource } from "./types";

/**
 * About page copy and media (layout: docs/ui-spec.md Part L). Every statement stays within what the
 * club has confirmed or what the rest of the site already states; figures are facts, not estimates.
 * Draft until the club approves the wording.
 */
export const about = {
  breadcrumb: [{ label: "Homepage", href: "/" }] satisfies LinkItem[],
  title: ["Rooted in Lagos,", "at home in Louisiana"],
  film: {
    sources: [{ src: "/media/hero-video.mp4", type: "video/mp4" }] satisfies VideoSource[],
    poster: resolveMedia({ asset: "heroVideoPoster" }),
    label: "Aerial footage of Louisiana, the club's home.",
  },
  statement: {
    label: "About us",
    paragraphs: [
      "Eko Club Louisiana brings together the sons, daughters and friends of Lagos.",
      "We are a nonprofit sociocultural community based in Baton Rouge. Through fellowship, culture and service, we keep the heritage of Lagos alive in Louisiana and work toward a lasting legacy for the next generation.",
    ],
  },
  story: {
    media: resolveMedia({ asset: "eclGroup2018" }),
    caption: "Members of Eko Club Louisiana at the December 2018 inauguration and ECI quarterly meeting.",
    paragraphs: [
      "Eko is the traditional name for Lagos, and our name carries that heritage across the Atlantic.",
      "The original Eko Club was founded in 1974. Eko Club Louisiana shares its name and spirit, and brings members together in Baton Rouge and across the state.",
      "Our work spans education, youth leadership, cultural heritage, humanitarian support, community building, and health and wellbeing.",
    ],
    link: { label: "Read our history", href: "/about/history" } satisfies LinkItem,
  },
  facts: {
    label: "Our club",
    heading: "Facts at a glance",
    items: [
      { value: "6", label: "Areas of focus" },
      { value: "2", label: "Homes: Lagos and Louisiana" },
      { value: "1974", label: "Year the original Eko Club was founded" },
      { value: "4", label: "Ways to take part" },
    ],
    action: { label: "Read our reports", href: "/reports" } satisfies LinkItem,
  },
  bands: [
    {
      id: "culture",
      label: "Culture",
      heading: "Traditions that travel with us",
      body: "Language, dress, music and celebration link our members in Louisiana to the heritage of Lagos. We gather to keep those traditions alive and to share them with the next generation.",
      link: { label: "Explore cultural heritage", href: causeHref("cultural-heritage") } satisfies LinkItem,
      media: resolveMedia({ asset: "lagosCarnival" }),
    },
    {
      id: "service",
      label: "Service",
      heading: "Learning, care and support where it is needed",
      body: "Education, humanitarian support and health and wellbeing guide how we serve. Members give their time and skills to help communities in Louisiana and in Lagos.",
      link: { label: "See our impact", href: "/impact" } satisfies LinkItem,
      media: resolveMedia({ asset: "greetingCelebration" }),
    },
  ],
  focus: {
    label: "Our areas of focus",
    heading: "Six areas guide our work",
    body: "Each area is a commitment the club shares. Find out what each one means and how to take part.",
    link: { label: "All programs & causes", href: "/programs" } satisfies LinkItem,
    items: published(causes).map((cause) => ({ number: cause.number, title: cause.title, href: causeHref(cause.slug) })),
  },
  places: {
    label: "Where we belong",
    heading: "Two homes, one community",
    body: "Our members live in Louisiana and carry Lagos with them. The club is where those two homes meet, in fellowship, celebration and service.",
    link: { label: "Get involved", href: "/get-involved" } satisfies LinkItem,
    items: [
      {
        title: "Baton Rouge, Louisiana",
        text: "Where the club is based and where members gather.",
        media: resolveMedia({ asset: "heroVideoPoster" }),
        action: { label: "Contact the club", href: "/contact" } satisfies LinkItem,
      },
      {
        title: "Lagos, Nigeria",
        text: "Eko, the heritage our name carries.",
        media: resolveMedia({ asset: "lagosEyoFloat" }),
        action: { label: "Our culture", href: "/culture" } satisfies LinkItem,
      },
    ],
  },
  ...meta(DRAFT, draftReview("About page copy written for the new layout; confirm wording, the facts list and the photographs with the club.")),
};
