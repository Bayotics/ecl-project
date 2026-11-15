import { DRAFT, draftReview, meta } from "./meta";
import type { LinkItem, MediaRef } from "./types";

/**
 * Program (mission area) detail pages: a theme and a sequence of sections per area. Each page uses its
 * own mix and order of layouts. Copy describes what the area means to the club and how members can
 * take part; it names no programs, figures or outcomes the club has not supplied.
 *
 * Images: every `ImageSlot` shows a themed gradient until `image` is set, e.g.
 *   { label: "Students studying together", image: { asset: "myNewAsset" } }
 * after registering the photo in content/media.ts.
 */

export interface ImageSlot {
  /** Describes the photograph this slot is waiting for (shown on the placeholder, used as alt text). */
  label: string;
  image?: MediaRef;
}

export interface ProgramTheme {
  /** Deep tone: dark bands and headings. */
  deep: string;
  /** Main accent: highlights, numbers, statement bands. */
  accent: string;
  /** Pale tint: light bands. */
  pale: string;
  /** Second colour used in gradient placeholders. */
  glow: string;
}

export type ProgramSection =
  | { kind: "statement"; label: string; text: string; tone: "accent" | "deep" | "pale" }
  | { kind: "split"; label: string; heading: string; paragraphs: string[]; image: ImageSlot; side: "left" | "right"; tone: "paper" | "pale" }
  | { kind: "pillars"; label: string; heading: string; items: { title: string; text: string }[]; tone: "paper" | "pale" | "deep" }
  | { kind: "steps"; label: string; heading: string; steps: { title: string; text: string; href?: string }[] }
  | { kind: "mosaic"; label: string; heading: string; text: string; slots: ImageSlot[] }
  | { kind: "quote"; text: string; note: string; image: ImageSlot }
  | { kind: "faq"; label: string; heading: string; items: { q: string; a: string }[] };

export interface ProgramPage {
  slug: string;
  theme: ProgramTheme;
  hero: { variant: "split" | "full" | "centered"; eyebrow: string; title: string; lead: string; image: ImageSlot };
  sections: ProgramSection[];
  cta: { heading: string; text: string; actions: (LinkItem & { primary?: boolean })[] };
}

const takePart = (slug: string) => [
  { label: "Volunteer", href: `/volunteer?interest=${slug}`, primary: true },
  { label: "Become a member", href: "/join" },
  { label: "Donate", href: "/donate" },
];

export const programPages: ProgramPage[] = [
  {
    slug: "education",
    theme: { deep: "#14304d", accent: "#2f6ea5", pale: "#e2ebf4", glow: "#7fb3dd" },
    hero: {
      variant: "split",
      eyebrow: "Program 01 · Education",
      title: "Learning that carries us forward",
      lead: "Encouraging study, sharing knowledge across generations and helping one another find the way forward, in Louisiana and in Lagos.",
      image: { label: "Members learning together" },
    },
    sections: [
      {
        kind: "statement",
        tone: "pale",
        label: "Why it matters",
        text: "Education opens doors. For a community with roots in Lagos and a home in Louisiana, learning is one of the most lasting gifts we can pass on.",
      },
      {
        kind: "pillars",
        tone: "paper",
        label: "What we care about",
        heading: "Four ways we think about learning",
        items: [
          { title: "Learning together", text: "Study is easier in good company. We encourage members of every age to keep learning and to learn from each other." },
          { title: "Across generations", text: "Elders carry experience, younger members bring new skills. Both have something to teach." },
          { title: "Sharing what we know", text: "Members' knowledge of schools, careers and life in Louisiana is a resource for the whole community." },
          { title: "Opening opportunity", text: "We want every young person in our community to see the paths that are open to them." },
        ],
      },
      {
        kind: "split",
        tone: "pale",
        side: "left",
        label: "In practice",
        heading: "Where learning happens",
        paragraphs: [
          "Learning happens at club gatherings, in conversations between members and in the encouragement families give one another.",
          "As the club develops its education work, this page will share what is planned and how to join in.",
        ],
        image: { label: "A club gathering or study session" },
      },
      {
        kind: "steps",
        label: "Take part",
        heading: "How you can support education",
        steps: [
          { title: "Share your experience", text: "Offer your knowledge of study, careers or settling in Louisiana to members who could use it.", href: "/volunteer?interest=education" },
          { title: "Encourage a young person", text: "A word of support or a little guidance can change how someone sees their future." },
          { title: "Join the club", text: "Members help shape where the club puts its time and energy.", href: "/join" },
          { title: "Give", text: "Gifts help the club support learning in our community.", href: "/donate" },
        ],
      },
      {
        kind: "faq",
        label: "Questions",
        heading: "About education at the club",
        items: [
          { q: "Do I need to be a member to help?", a: "No. Anyone who shares the club's values can offer their time through the volunteer form; membership is welcome too." },
          { q: "I have a skill to share. Who do I tell?", a: "Use the volunteer form and choose Education, or contact the club directly. Someone will be in touch." },
          { q: "Where will future activities be announced?", a: "On the Events page and through the club's newsletter." },
        ],
      },
    ],
    cta: { heading: "Help someone take their next step", text: "Support education with your time, your membership or a gift.", actions: takePart("education") },
  },
  {
    slug: "youth-leadership",
    theme: { deep: "#4a2205", accent: "#d9731c", pale: "#fbeadb", glow: "#f2b45c" },
    hero: {
      variant: "full",
      eyebrow: "Program 02 · Youth Leadership",
      title: "The next generation leads",
      lead: "A place for young people of Lagos heritage in Louisiana to belong, to learn from those who came before them and to lead in their own right.",
      image: { label: "Young members in matching club shirts standing behind a table of donated supplies", image: { asset: "youthHeroBanner" } },
    },
    sections: [
      {
        kind: "split",
        tone: "paper",
        side: "right",
        label: "Belonging",
        heading: "A place to belong",
        paragraphs: [
          "Growing up between two cultures is a gift, and sometimes a challenge. The club is a place where young people can be proud of both.",
          "Here they meet others who share their heritage, and adults who want to see them thrive.",
        ],
        image: { label: "Young members in matching club shirts standing together", image: { asset: "youthPlaceToBelong" } },
      },
      {
        kind: "statement",
        tone: "deep",
        label: "Our belief",
        text: "Young people are not only the future of the club. They are part of it now, with ideas and energy of their own.",
      },
      {
        kind: "mosaic",
        label: "Moments",
        heading: "Young voices, shared moments",
        text: "Photographs of young members taking part in club life.",
        slots: [
          { label: "Young members and volunteers gathered around a table of donated supplies", image: { asset: "youthMoment1" } },
          { label: "A young drummer marching with musicians in a street parade", image: { asset: "youthMoment2" } },
          { label: "Young volunteers sorting donated personal-care supplies", image: { asset: "youthMoment3" } },
          { label: "Young people with family and friends at a club gathering", image: { asset: "youthMoment4" } },
          { label: "Club members smiling together in matching shirts", image: { asset: "youthMoment5" } },
        ],
      },
      {
        kind: "pillars",
        tone: "pale",
        label: "Growing leaders",
        heading: "Belong. Learn. Lead.",
        items: [
          { title: "Belong", text: "Feel at home in a community that knows where you come from." },
          { title: "Learn", text: "Learn from members who have built lives and careers in Louisiana." },
          { title: "Lead", text: "Take on responsibility, share ideas and help shape what the club does." },
        ],
      },
      {
        kind: "steps",
        label: "Get involved",
        heading: "Ways to support young people",
        steps: [
          { title: "Bring young people along", text: "Club gatherings are open to families. Bring the young people in your life.", href: "/events" },
          { title: "Mentor", text: "Offer your time and experience to a young member.", href: "/volunteer?interest=youth-leadership" },
          { title: "Make room", text: "Invite young members to help plan and lead club activities." },
        ],
      },
    ],
    cta: { heading: "Invest in the next generation", text: "Support youth leadership with your time, your membership or a gift.", actions: takePart("youth-leadership") },
  },
  {
    slug: "cultural-heritage",
    theme: { deep: "#311845", accent: "#7d44a8", pale: "#efe7f5", glow: "#c9a227" },
    hero: {
      variant: "centered",
      eyebrow: "Program 03 · Cultural Heritage",
      title: "Traditions that travel with us",
      lead: "The language, dress, music and celebrations of Lagos are part of who we are. The club is a place to keep them alive and pass them on.",
      image: { label: "Members in royal-blue attire and gele head wraps gathered for a group photograph in a hall", image: { asset: "heritageHeroBanner" } },
    },
    sections: [
      {
        kind: "pillars",
        tone: "paper",
        label: "What we keep alive",
        heading: "The threads of our heritage",
        items: [
          { title: "Language", text: "Yoruba and the expressions of Lagos, spoken at home and shared at gatherings." },
          { title: "Dress", text: "Aso-oke, agbada, gele: attire that marks our celebrations and our pride." },
          { title: "Music & dance", text: "The rhythms of home, played and danced wherever we gather." },
          { title: "Celebration", text: "Festivals and occasions that bring our community together." },
        ],
      },
      {
        kind: "mosaic",
        label: "Gallery",
        heading: "Culture in colour",
        text: "Photographs of dress, music and celebration in our community.",
        slots: [
          { label: "Two men in white traditional attire and blue caps, one wearing coral beads", image: { asset: "heritageTradAttire" } },
          { label: "A brass band and a costumed masquerade performer at a celebration", image: { asset: "heritageDrummers" } },
          { label: "Women in blue and gold traditional attire dancing with hand fans", image: { asset: "heritageDance" } },
          { label: "Members in traditional prints holding up white handkerchiefs at a street celebration", image: { asset: "heritageFestival" } },
          { label: "Members in white attire and gold-trimmed stoles standing together in front of a stage", image: { asset: "heritageFamily" } },
          { label: "A brass player, a smiling woman and a feathered masquerade performer at a celebration", image: { asset: "heritageCelebration" } },
        ],
      },
      {
        kind: "quote",
        text: "Eko is the traditional name for Lagos, and our name carries that heritage across the Atlantic.",
        note: "Eko Club Louisiana",
        image: { label: "A white-robed Eyo masquerade figure in a wide-brimmed hat on a parade float", image: { asset: "heritagePortrait" } },
      },
      {
        kind: "split",
        tone: "pale",
        side: "left",
        label: "Passing it on",
        heading: "From one generation to the next",
        paragraphs: [
          "Traditions last when they are shared. Our gatherings are a chance for children and grandchildren to see, hear and wear their heritage.",
          "Every celebration is also a lesson in where we come from.",
        ],
        image: { label: "Members in traditional attire seated together at a club gathering", image: { asset: "heritageEldersYoung" } },
      },
      {
        kind: "faq",
        label: "Questions",
        heading: "Joining in",
        items: [
          { q: "Do I need to be from Lagos to take part?", a: "No. The club welcomes the sons, daughters and friends of Lagos, and anyone who wants to share in the culture." },
          { q: "How do I find out about celebrations?", a: "Watch the Events page and sign up for the newsletter." },
          { q: "Can I help organise a cultural event?", a: "Yes. Use the volunteer form and choose Cultural Heritage." },
        ],
      },
    ],
    cta: { heading: "Keep our traditions connected", text: "Support cultural heritage with your time, your membership or a gift.", actions: takePart("cultural-heritage") },
  },
  {
    slug: "humanitarian-support",
    theme: { deep: "#0e3a36", accent: "#1d8577", pale: "#ddf0ec", glow: "#7fcfc2" },
    hero: {
      variant: "split",
      eyebrow: "Program 04 · Humanitarian Support",
      title: "Together in service",
      lead: "Bringing people together in service, and helping where help is needed, in Louisiana and in Lagos.",
      image: { label: "A large group of volunteers in club shirts behind tables of donated supplies", image: { asset: "humanitarianHero" } },
    },
    sections: [
      {
        kind: "statement",
        tone: "accent",
        label: "Our approach",
        text: "When someone in our community needs help, we come together. Service is how we turn fellowship into something that lasts.",
      },
      {
        kind: "pillars",
        tone: "pale",
        label: "Two homes",
        heading: "Where we serve",
        items: [
          { title: "In Louisiana", text: "Supporting neighbours, families and the wider community where our members live." },
          { title: "In Lagos", text: "Keeping our connection to home alive by helping where help is needed." },
        ],
      },
      {
        kind: "split",
        tone: "paper",
        side: "right",
        label: "In action",
        heading: "Many hands",
        paragraphs: [
          "Service is a shared effort: members giving time, gathering supplies and showing up for one another.",
          "As the club plans its service activities, they will be shared on this page and on the Events page.",
        ],
        image: { label: "Club members smiling together beside a box and bags of donations", image: { asset: "humanitarianManyHands" } },
      },
      {
        kind: "steps",
        label: "Take part",
        heading: "How you can help",
        steps: [
          { title: "Volunteer", text: "Give your time when the club organises service activities.", href: "/volunteer?interest=humanitarian-support" },
          { title: "Give", text: "Donations help the club respond when help is needed.", href: "/donate" },
          { title: "Tell us about a need", text: "If you know of a need the club could help with, let us know.", href: "/contact" },
          { title: "Spread the word", text: "Share the club's work with friends who may want to help." },
        ],
      },
      {
        kind: "mosaic",
        label: "Moments",
        heading: "Service in pictures",
        text: "Photographs of members serving together.",
        slots: [
          { label: "Club members standing beside bags of donated clothing", image: { asset: "humanitarianSorting" } },
          { label: "Volunteers in club shirts posing together for a team photo", image: { asset: "humanitarianTeam" } },
          { label: "Volunteers handing out personal-care supplies from a table", image: { asset: "humanitarianGiving" } },
          { label: "Community members, including an older man with a walker, gathered at the outreach", image: { asset: "humanitarianOutreach" } },
        ],
      },
    ],
    cta: { heading: "Lend a hand", text: "Support humanitarian work with your time, your membership or a gift.", actions: takePart("humanitarian-support") },
  },
  {
    slug: "community-building",
    theme: { deep: "#45190f", accent: "#b9532f", pale: "#f6e3da", glow: "#e8a07a" },
    hero: {
      variant: "full",
      eyebrow: "Program 05 · Community Building",
      title: "No one makes a home alone",
      lead: "The club brings the sons, daughters and friends of Lagos together, so that no one has to make a home in Louisiana alone.",
      image: { label: "Members gathered together" },
    },
    sections: [
      {
        kind: "mosaic",
        label: "Fellowship",
        heading: "The faces of our community",
        text: "Photographs from club gatherings and celebrations.",
        slots: [
          { label: "Members at a gathering" },
          { label: "Friends greeting each other" },
          { label: "A shared meal" },
          { label: "Families together" },
          { label: "Group photo" },
        ],
      },
      {
        kind: "split",
        tone: "pale",
        side: "left",
        label: "Belonging",
        heading: "A community you can lean on",
        paragraphs: [
          "Moving far from home is easier when you find people who understand where you come from.",
          "The club is that community: a place for friendship, for celebration and for support when times are hard.",
        ],
        image: { label: "Members talking and laughing" },
      },
      {
        kind: "quote",
        text: "Through fellowship, culture and service, we keep the heritage of Lagos alive in Louisiana.",
        note: "Eko Club Louisiana",
        image: { label: "A celebration moment" },
      },
      {
        kind: "pillars",
        tone: "paper",
        label: "What holds us together",
        heading: "Four foundations",
        items: [
          { title: "Fellowship", text: "Regular time together, so friendships can grow." },
          { title: "Celebration", text: "Marking life's milestones with the people who matter." },
          { title: "Support", text: "Standing with members in good times and hard ones." },
          { title: "Welcome", text: "Opening the door to newcomers and friends of Lagos." },
        ],
      },
      {
        kind: "faq",
        label: "Questions",
        heading: "Finding your place",
        items: [
          { q: "I'm new to Louisiana. Can I come along?", a: "Yes. Newcomers are welcome; contact the club or come to an upcoming event." },
          { q: "How do I become a member?", a: "Start on the Join page; it explains how membership works." },
          { q: "Can my family come to events?", a: "Club gatherings are open to members' families." },
        ],
      },
    ],
    cta: { heading: "Come and find your community", text: "Support community building with your time, your membership or a gift.", actions: takePart("community-building") },
  },
  {
    slug: "health-and-wellbeing",
    theme: { deep: "#14361f", accent: "#2f8346", pale: "#e1f0e3", glow: "#9fd1a6" },
    hero: {
      variant: "centered",
      eyebrow: "Program 06 · Health and Wellbeing",
      title: "Looking after one another",
      lead: "Supporting healthier communities, and looking after one another in body and mind.",
      image: { label: "Health and wellbeing in the community" },
    },
    sections: [
      {
        kind: "pillars",
        tone: "pale",
        label: "Whole-person wellbeing",
        heading: "Body, mind and community",
        items: [
          { title: "Body", text: "Encouraging members to look after their physical health and to seek care early." },
          { title: "Mind", text: "Making it easier to talk about stress, pressure and mental wellbeing." },
          { title: "Community", text: "Checking in on one another, because no one should face illness alone." },
        ],
      },
      {
        kind: "split",
        tone: "paper",
        side: "right",
        label: "Care",
        heading: "Health is a shared concern",
        paragraphs: [
          "Good health starts with information and with people who care. Members with health knowledge can help others understand their options.",
          "As the club plans wellbeing activities, they will be announced on this page and the Events page.",
        ],
        image: { label: "A health check or wellbeing activity" },
      },
      {
        kind: "statement",
        tone: "deep",
        label: "Our belief",
        text: "A strong community is a healthy one. Looking after one another is part of what it means to belong.",
      },
      {
        kind: "steps",
        label: "Take part",
        heading: "How you can support wellbeing",
        steps: [
          { title: "Check in", text: "Reach out to a member you haven't heard from in a while." },
          { title: "Share your expertise", text: "Health professionals can offer their knowledge through the volunteer form.", href: "/volunteer?interest=health-and-wellbeing" },
          { title: "Join an activity", text: "Watch for wellbeing activities on the Events page.", href: "/events" },
          { title: "Give", text: "Gifts help the club support members' health and wellbeing.", href: "/donate" },
        ],
      },
      {
        kind: "mosaic",
        label: "Moments",
        heading: "Wellbeing together",
        text: "Photographs of members caring for their health and for one another.",
        slots: [{ label: "Health outreach" }, { label: "Members exercising or walking" }, { label: "A wellbeing conversation" }, { label: "Community care" }],
      },
    ],
    cta: { heading: "Help our community thrive", text: "Support health and wellbeing with your time, your membership or a gift.", actions: takePart("health-and-wellbeing") },
  },
];

export const programPage = (slug: string) => programPages.find((page) => page.slug === slug);

export const programsReview = meta(DRAFT, draftReview("Program page copy is an editorial draft; confirm wording with the club. Images are placeholders until photographs are added."));
