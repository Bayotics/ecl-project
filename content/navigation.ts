import { causeHref, causes } from "./causes";
import { events } from "./events";
import { eventHref } from "./event-view";
import { resolveMedia } from "./media";
import { formatPartialDate, published } from "./meta";
import { settings } from "./site";
import { socialLinks } from "./social";
import { searchIndex } from "./search";
import type { EventCardView, EventRecord, FooterColumn, HeaderData, LinkItem } from "./types";

const causeLinks: LinkItem[] = published(causes).map((cause) => ({ label: cause.title, href: causeHref(cause.slug) }));

export const routes = {
  home: "/",
  programs: "/programs",
  community: "/gallery",
  about: "/about",
  history: "/about/history",
  leadership: "/about/leadership",
  impact: "/impact",
  news: "/news",
  events: "/events",
  getInvolved: "/get-involved",
  join: "/join",
  volunteer: "/volunteer",
  reports: "/reports",
  donate: "/donate",
  contact: "/contact",
  search: "/search",
} as const;

/* ── Events panel cards ──────────────────────────────────────────────── */

const eventMeta = (event: EventRecord, status: string) =>
  [event.date ? formatPartialDate(event.date) : null, event.location, status].filter(Boolean).join(" · ");

const toCard = (event: EventRecord, status: string): EventCardView => ({
  kind: "event",
  slug: event.slug,
  title: event.title,
  href: eventHref(event.slug),
  meta: eventMeta(event, status),
  media: resolveMedia(event.media),
});

/**
 * Three cards from real records only. Announced events come first; past events are labelled as such;
 * when nothing is announced, the last slot honestly says so instead of inventing an event.
 */
function eventCards(): EventCardView[] {
  const list = published(events);
  const byDateDesc = (a: EventRecord, b: EventRecord) => (b.date?.value ?? "").localeCompare(a.date?.value ?? "");
  const upcoming = list.filter((event) => !event.historical).sort((a, b) => -byDateDesc(a, b));
  const past = list.filter((event) => event.historical).sort(byDateDesc);

  if (upcoming.length) {
    return [...upcoming.map((e) => toCard(e, "Upcoming")), ...past.map((e) => toCard(e, "Past event"))].slice(0, 3);
  }
  return [
    ...past.slice(0, 2).map((e) => toCard(e, "Past event")),
    {
      kind: "status",
      title: "Upcoming events",
      text: "None announced yet",
      action: { label: "Get updates", href: "/#newsletter" },
    },
  ];
}

/* ── Header ──────────────────────────────────────────────────────────── */

export const headerData: HeaderData = {
  siteName: settings.name,
  utility: {
    text: "Eko Club Louisiana · Baton Rouge",
    links: [
      { label: "Join us", href: routes.join },
      { label: "Contact", href: routes.contact },
    ],
  },
  nav: [
    { id: "programs", label: "Programs", href: routes.programs, panel: "programs" },
    { id: "about", label: "About us", href: routes.about },
    { id: "involved", label: "Get involved", href: routes.getInvolved },
    { id: "events", label: "Events", href: routes.events, panel: "events" },
  ],
  donate: { label: "Donate", href: routes.donate },
  programs: {
    label: "Programs & causes",
    links: causeLinks,
    media: resolveMedia({ asset: "asoOkeCouple" }),
    viewAll: { label: "All programs & causes", href: routes.programs },
  },
  events: {
    label: "Events",
    invitation: "Moments that bring our community together",
    allEvents: { label: "All events", href: routes.events },
    cards: eventCards(),
  },
  menu: {
    label: "Welcome to ECL",
    feature: [
      { label: "Programs & causes", href: routes.programs },
      { label: "Our community", href: routes.community },
    ],
    columns: [
      {
        heading: "About ECL",
        links: [
          { label: "About us", href: routes.about },
          { label: "History", href: routes.history },
          { label: "Leadership", href: routes.leadership },
          { label: "Our impact", href: routes.impact },
          { label: "News", href: routes.news },
        ],
      },
      {
        heading: "Take part",
        links: [
          { label: "Join us", href: routes.join },
          { label: "Volunteer", href: routes.volunteer },
          { label: "Reports", href: routes.reports },
          { label: "Donate", href: routes.donate },
          { label: "Contact", href: routes.contact },
        ],
      },
    ],
    social: {
      label: "Follow us",
      // Only club-approved accounts; none have been confirmed yet.
      links: published(socialLinks).map((link) => ({ label: link.label, href: link.url })),
      emptyText: "Official accounts will be listed here",
    },
  },
  search: {
    label: "Search",
    suggestions: [
      { label: "Education", href: causeHref("education") },
      { label: "Cultural Heritage", href: causeHref("cultural-heritage") },
      { label: "Events", href: routes.events },
      { label: "Gallery", href: routes.community },
    ],
    // Public records only; used for live results in the header search panel.
    index: searchIndex(),
  },
};

/* ── Footer ──────────────────────────────────────────────────────────── */

const { contact } = settings;

/** Six compact columns (Prompt 8): identity · location · About · Take part · Programs & causes · Contact. */
export const footerColumns: FooterColumn[] = [
  {
    heading: settings.name,
    links: [
      { label: contact.phone.display, href: `tel:${contact.phone.tel}` },
      { label: contact.email, href: `mailto:${contact.email}` },
    ],
  },
  {
    heading: "Location",
    // Street address withheld until confirmed (see content/review.ts).
    lines: [contact.location, "A nonprofit sociocultural community rooted in the heritage of Lagos."],
    links: [],
  },
  {
    heading: "About",
    links: [
      { label: "About us", href: routes.about },
      { label: "History", href: routes.history },
      { label: "Leadership", href: routes.leadership },
      { label: "Our impact", href: routes.impact },
      { label: "News", href: routes.news },
    ],
  },
  {
    heading: "Take part",
    links: [
      { label: "Join us", href: routes.join },
      { label: "Volunteer", href: routes.volunteer },
      { label: "Events", href: routes.events },
      { label: "Donate", href: routes.donate },
      { label: "Reports", href: routes.reports },
    ],
  },
  { heading: "Programs & causes", links: causeLinks },
  {
    heading: "Contact",
    links: [
      { label: "Contact us", href: routes.contact, dialog: "contact" },
      { label: "Newsletter", href: "/contact#newsletter", dialog: "newsletter" },
      // Approved social accounts only (none confirmed yet).
      ...published(socialLinks).map((link) => ({ label: link.label, href: link.url })),
    ],
  },
];

export const legalLinks: LinkItem[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "/cookies" },
  { label: "Preferences", href: "/cookies#preferences" },
  { label: "Accessibility", href: "/accessibility" },
];
