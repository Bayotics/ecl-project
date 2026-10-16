import { causes } from "./causes";
import { donationSettings } from "./donations";
import { chapterHistory, originalHistory } from "./history";
import { metrics, testimonials } from "./impact";
import { policyReview } from "./policies";
import { events } from "./events";
import { albums } from "./gallery";
import { heroSlides } from "./hero";
import { leadership } from "./leadership";
import { assets, outstandingMedia } from "./media";
import { news } from "./news";
import { reports } from "./reports";
import { contactBand, editorial, intro, mission, settings, whoWeServe } from "./site";
import { socialLinks } from "./social";
import { stories } from "./stories";
import type { RecordMeta } from "./types";

/**
 * Factual review flags from Prompt 2. Internal only: these explain what the site must NOT
 * state until the club confirms it. Nothing here is rendered publicly.
 */
export const factualFlags = [
  {
    topic: "Street address",
    finding:
      "Contact page: 17669 Willow Trail Drive, Baton Rouge, LA 70817. Old footer: 7240 Renoir Ave, Baton Rouge, Louisiana 70806.",
    rule: "Show 'Baton Rouge, Louisiana' until the correct street address is confirmed.",
  },
  { topic: "Phone", finding: "Published phone: (225) 932-9150.", rule: "Use as published." },
  {
    topic: "Email",
    finding: "Published email: info@ekoclublouisiana.com (.com, while the site is .org).",
    rule: "Use as published; do not change it to .org automatically.",
  },
  {
    topic: "Age and size",
    finding: "The old site's '20 years' and 'over 1000 members'.",
    rule: "Not verified current chapter statistics. Do not use.",
  },
  {
    topic: "Founding date",
    finding: "The original Eko Club's 1974 founding and May 1975 launch.",
    rule: "Not a confirmed Louisiana founding date. Do not present as ECL's founding.",
  },
  { topic: "2021 convention", finding: "Referenced on the old site.", rule: "Historical. Never present as upcoming." },
  {
    topic: "Do not invent",
    finding: "Officers, financial reports, testimonials, social URLs, future events, tax recognition, impact totals.",
    rule: "Leave the corresponding records empty until the club supplies them.",
  },
] as const;

export interface ReviewItem {
  area: string;
  status: RecordMeta["status"];
  note: string;
}

/** Every outstanding record-level check, for a pre-launch review pass. */
export function getReviewFlags(): ReviewItem[] {
  const named: Array<[string, RecordMeta]> = [
    ["Site settings", settings],
    ["Mission copy", mission],
    ["Intro copy", intro],
    ["Editorial copy", editorial],
    ["Contact band copy", contactBand],
    ["Who we serve copy", whoWeServe],
    ["History: original Eko Club", originalHistory],
    ["History: Eko Club Louisiana", chapterHistory],
    ["Donation settings", donationSettings],
    ["Privacy and cookie notices", policyReview],
    ...heroSlides.map((slide, i): [string, RecordMeta] => [`Hero slide ${i + 1}`, slide]),
    ...causes.map((cause): [string, RecordMeta] => [`Cause: ${cause.title}`, cause]),
    ...[...stories, ...news, ...events].map((item): [string, RecordMeta] => [`${item.kind}: ${item.title}`, item]),
    ...albums.map((album): [string, RecordMeta] => [`Album: ${album.title}`, album]),
    ...leadership.map((leader): [string, RecordMeta] => [`Leader: ${leader.name}`, leader]),
    ...reports.map((report): [string, RecordMeta] => [`Report: ${report.title}`, report]),
    ...metrics.map((metric): [string, RecordMeta] => [`Figure: ${metric.label}`, metric]),
    ...testimonials.map((quote): [string, RecordMeta] => [`Testimonial: ${quote.name}`, quote]),
    ...socialLinks.map((link): [string, RecordMeta] => [`Social: ${link.label}`, link]),
    ...Object.values(assets).map((asset): [string, RecordMeta] => [`Media: ${asset.id}`, asset]),
  ];

  const items = named.flatMap(([area, record]) =>
    record.review.notes.map((note) => ({ area, status: record.status, note })),
  );
  const media = outstandingMedia.map((item) => ({
    area: `Outstanding media: ${item.placement}`,
    status: "draft" as const,
    note: item.need,
  }));
  return [...items, ...media];
}
