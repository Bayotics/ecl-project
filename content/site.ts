import { causeHref, causes } from "./causes";
import { BRIEF_2, DRAFT, briefReview, draftReview, meta, published } from "./meta";
import { resolveMedia } from "./media";
import type { LinkItem, RevealPanelContent, SiteSettings, VideoSource } from "./types";

/** Site settings. Contact facts come from Prompt 2; see content/review.ts for the open questions. */
export const settings: SiteSettings = {
  name: "Eko Club Louisiana",
  shortName: "ECL",
  description:
    "Eko Club Louisiana brings together the sons, daughters and friends of Lagos to strengthen community, preserve cultural heritage and support education and humanitarian service.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ekoclublouisiana.org",
  locale: "en_US",
  legalLine: "A nonprofit sociocultural community based in Baton Rouge, Louisiana.",
  contact: {
    // Published address as given; do not "correct" it to the .org domain.
    email: "info@ekoclublouisiana.com",
    phone: { display: "(225) 932-9150", tel: "+12259329150" },
    location: "Baton Rouge, Louisiana",
    // Two different street addresses have been published; withheld until the club confirms one.
    streetAddress: null,
  },
  ...meta(
    { source: "brief-prompt-2", note: "Published phone, email and city from the existing site, via Prompt 2" },
    {
      verified: false,
      notes: [
        "Street address unresolved: the contact page lists 17669 Willow Trail Drive, Baton Rouge, LA 70817; the old footer lists 7240 Renoir Ave, Baton Rouge, Louisiana 70806. Show 'Baton Rouge, Louisiana' until confirmed.",
        "Email is info@ekoclublouisiana.com (note .com) while the site is ekoclublouisiana.org. Confirm the inbox is live; do not change it automatically.",
      ],
    },
  ),
};

/* ── Homepage copy ─────────────────────────────────────────────────── */

export const mission = {
  label: "Our mission",
  paragraphs: [
    "Eko Club Louisiana brings together the sons, daughters and friends of Lagos to strengthen community, preserve cultural heritage and support education and humanitarian service.",
    "Through fellowship, youth leadership and community participation, we work toward a lasting legacy for the next generation.",
  ],
  ...meta(BRIEF_2, briefReview()),
};

/**
 * President's address, shown as a video card beside the mission (homepage). Club staff: put the file in
 * public/media/ (MP4/H.264, ideally with a WebVTT captions file) and list it in `sources`; add the
 * President's name in `speaker` once confirmed. Until a source is listed the card says "Video coming soon".
 */
export const presidentAddress = {
  label: "From the President",
  title: "A message from our President",
  speaker: null as string | null,
  duration: null as string | null,
  sources: [] as VideoSource[],
  captions: null as string | null,
  poster: resolveMedia({ asset: "eclGroup2018", focal: { x: 52, y: 55 } }),
  ...meta(DRAFT, draftReview("Supply the President's speech video (and captions), the speaker's name and the duration.")),
};

export const intro = {
  label: "Who we are",
  heading: "Rooted in Lagos. At home in Louisiana.",
  body: "We are a sociocultural community based in Baton Rouge, connecting the heritage of Lagos with life in Louisiana.",
  link: { label: "About the club", href: "/about" } satisfies LinkItem,
  ...meta(DRAFT, draftReview()),
};

/** Left panel of the three-panel row (Prompt 5): static and editorial. */
/** About page: who the club serves (Prompt 9). */
export const whoWeServe = {
  heading: "Who we serve",
  body: "The club is a home for the sons, daughters and friends of Lagos living in Louisiana, and for their families. Its work reaches the wider community in Louisiana and connects with Lagos.",
  ...meta(DRAFT, draftReview()),
};

export const whatWeDo = {
  label: "What we do",
  heading: "A legacy we share",
  paragraphs: [
    "We keep the language, dress and traditions of Lagos alive in Louisiana, and pass them to the next generation.",
    "Through education, service and fellowship, we build a community where everyone belongs.",
  ],
  ...meta(DRAFT, draftReview()),
};

export const impactPanel: RevealPanelContent = {
  id: "impact",
  title: "Our impact",
  // Supplied in Prompt 5; deliberately asserts no project or total.
  body: "Our shared heritage brings people together. Discover the stories, participation and service that shape the ECL community.",
  action: { label: "Explore our impact", href: "/impact" },
  media: resolveMedia({ asset: "celebrationGuests" }),
};

export const causesPanel: RevealPanelContent = {
  id: "causes",
  title: "Our causes",
  links: published(causes).map((cause) => ({ label: cause.title, href: causeHref(cause.slug) })),
  media: resolveMedia({ asset: "eldersGathering" }),
};

export const causesSection = {
  heading: "Explore our causes",
};

export const culture: {
  label: string;
  heading: string;
  /** Used by the /culture page intro; the homepage feature shows label, heading and action only. */
  body: string;
  link: LinkItem;
  poster: ReturnType<typeof resolveMedia>;
  /** Empty until club footage is supplied (see outstandingMedia). */
  video: VideoSource[];
  videoLabel: string;
} = {
  label: "Our culture",
  heading: "Rooted in Lagos. Connected in Louisiana.",
  body: "Language, dress, music and celebration link our members in Louisiana to the heritage of Lagos.",
  link: { label: "About the club", href: "/about" },
  poster: resolveMedia({ asset: "lagosEyoFloat" }),
  video: [],
  videoLabel: "A white-robed Eyo masquerade float on parade in Lagos.",
};

/** Editorial row (Prompt 7). Copy supplied in the brief; no fees, eligibility, schedules or assignments. */
export const editorial = {
  label: "Get involved",
  heading: "A community built together",
  paragraphs: [
    "There are many ways to take part in the ECL community, from membership and volunteering to supporting the causes we care about.",
    "Explore how you can share your time, ideas and support while helping strengthen the connections between our heritage and the next generation.",
  ],
  link: { label: "Find your way to get involved", href: "/get-involved" } satisfies LinkItem,
  media: resolveMedia({ asset: "lagosCarnival" }),
  ...meta(BRIEF_2, briefReview("A photograph of Eko Club Louisiana members taking part would suit this row better than the Lagos carnival photograph.")),
};

export const newsSection = {
  heading: "News & Events",
  action: { label: "View all updates", href: "/news" } satisfies LinkItem,
};

/** Contact / newsletter band (Prompt 8). The newsletter line is supplied copy. */
export const contactBand = {
  invitation: ["Have a", "question?"],
  contact: {
    heading: "Contact us",
    body: "Questions about membership, events or partnerships? Send us a message and we will be glad to help.",
    action: { label: "Send a message", href: "/contact" } satisfies LinkItem,
  },
  newsletter: {
    heading: "Newsletter",
    body: "Get updates on community programs, volunteer opportunities and club news.",
    action: { label: "Sign up for updates", href: "/contact#newsletter" } satisfies LinkItem,
  },
  ...meta(DRAFT, draftReview("Contact paragraph is an editorial draft; the newsletter line is supplied in Prompt 8.")),
};
