import type { StaticImageData } from "next/image";

import type { SearchEntry } from "@/lib/search-match";

/* ── Record metadata (every record carries this) ─────────────────── */

export type Status = "published" | "draft";

/** Where a record's facts or media came from. */
export interface Provenance {
  source:
    | "brief-prompt-1"
    | "brief-prompt-2"
    | "brief-prompt-9"
    | "ekoclublouisiana.org"
    | "photo-evidence"
    | "editorial-draft"
    | "club-supplied";
  url?: string;
  /** ISO date the source was retrieved or read. */
  retrieved?: string;
  note?: string;
}

/** Editorial checks. A record is launch-ready when `verified` is true and `notes` is empty. */
export interface Review {
  verified: boolean;
  notes: string[];
}

export interface RecordMeta {
  status: Status;
  provenance: Provenance;
  review: Review;
}

/** A date known only to a given precision, e.g. "2021" (year) or "2018-12" (month). */
export interface PartialDate {
  value: string;
  precision: "year" | "month" | "day";
}

/* ── Media ───────────────────────────────────────────────────────── */

export type AssetId =
  | "eclGroup2018"
  | "eclCrest"
  | "heroVideoPoster"
  | "lagosEyoFloat"
  | "lagosCarnival"
  | "eldersGathering"
  | "celebrationGuests"
  | "asoOkeCouple"
  | "communityDance"
  | "familyCelebration"
  | "greetingCelebration";

/** Focal point in percent of the source image (0–100). */
export interface Focal {
  x: number;
  y: number;
}

export interface MediaAsset extends RecordMeta {
  id: AssetId;
  kind: "photo" | "logo";
  src: StaticImageData;
  alt: string;
  focal: Focal;
  credit: string | null;
  original: { file: string; width: number; height: number };
}

/** How a record shows an asset: crop focus, zoom and fit. */
export interface MediaRef {
  remote?: StaticImageData;
  asset: AssetId;
  focal?: Focal;
  zoom?: number;
  fit?: "cover" | "contain";
  /** Placement-specific description when the crop shows only part of the asset. */
  alt?: string;
}

/** A MediaRef resolved for rendering. Plain data, so it can be passed to client components. */
export interface ResolvedMedia {
  src: StaticImageData;
  alt: string;
  kind: "photo" | "logo";
  fit: "cover" | "contain";
  /** CSS object-position / transform-origin, e.g. "50% 58%". */
  position: string;
  zoom: number;
}

/* ── Content records ─────────────────────────────────────────────── */

export interface LinkItem {
  label: string;
  href: string;
}

export interface SiteSettings extends RecordMeta {
  name: string;
  shortName: string;
  description: string;
  url: string;
  locale: string;
  legalLine: string;
  contact: {
    email: string;
    phone: { display: string; tel: string };
    /** Public location line. A street address is withheld until confirmed. */
    location: string;
    streetAddress: string | null;
  };
}

export interface HeroSlide extends RecordMeta {
  id: string;
  /** Control-strip tab label, shown as "1. Our mission". */
  tab: string;
  eyebrow: string;
  headline: string;
  text: string;
  cta: LinkItem;
  /** Photograph, and the poster for `video` when footage exists. */
  media: MediaRef;
  /**
   * Muted looping footage under stable copy. Cuts inside the clip are not slides.
   * Empty until real club footage is supplied; the photograph is shown instead.
   */
  video: VideoSource[];
}

/** A mission area. Not a named program or completed project. */
export interface Cause extends RecordMeta {
  slug: string;
  number: string;
  title: string;
  short: string;
  /** What the area means for the club, in plain paragraphs. No invented projects or outcomes. */
  body: string[];
  media: MediaRef;
}

interface FeedRecord extends RecordMeta {
  slug: string;
  title: string;
  excerpt: string;
  /** `null` until a confirmed date is supplied. */
  date: PartialDate | null;
  media: MediaRef;
  /** Full text as paragraphs. Empty when only the excerpt is known. */
  body: string[];
}

/** An impact story or volunteer highlight. Never invented: written from what the club supplies. */
export interface Story extends FeedRecord {
  kind: "story";
  /** Mission area slug, so the story appears on that program page. */
  cause: string | null;
  volunteerHighlight: boolean;
}

export interface NewsItem extends FeedRecord {
  kind: "news";
}

/** Time zones the club holds events in. Louisiana uses Central Time, with daylight saving. */
export type EventTimeZone = "America/Chicago" | "Africa/Lagos";

/** A confirmed date and time, as wall-clock time where the event happens. */
export interface EventSchedule {
  /** Local start, "YYYY-MM-DDTHH:mm". */
  start: string;
  /** Local end, "YYYY-MM-DDTHH:mm", when announced. */
  end: string | null;
  timeZone: EventTimeZone;
}

export interface RsvpConfig {
  enabled: boolean;
  /** Total attendees accepted. `null` = no limit configured. Needs a data store to enforce. */
  capacity: number | null;
  /** Largest party one RSVP may register (including the person replying). */
  maxPartySize: number;
  /** Local "YYYY-MM-DDTHH:mm" after which RSVPs close; defaults to the event start. */
  closes: string | null;
}

export interface EventRecord extends FeedRecord {
  managedId?: string;
  kind: "event";
  /** Past events must never be presented as upcoming. Forces "past" whatever the dates say. */
  historical: boolean;
  /** One of `eventCategories` in content/events.ts. */
  category: string;
  location: string | null;
  /** Present only when the club has confirmed the date and time. */
  schedule: EventSchedule | null;
  rsvp: RsvpConfig | null;
}

export type FeedItem = Story | NewsItem | EventRecord;

/** A published figure: shown only with its date and source. */
export interface Metric extends RecordMeta {
  slug: string;
  /** Display value exactly as confirmed, e.g. "120". */
  value: string;
  label: string;
  /** ISO date the figure was true for. */
  asOf: string;
  source: { label: string; url?: string };
}

/** An attributed testimonial the person has approved for publication. */
export interface Testimonial extends RecordMeta {
  slug: string;
  quote: string;
  name: string;
  /** e.g. "Member since 2019" or "Volunteer". */
  context: string | null;
  /** The person agreed to publication with their name. */
  consent: boolean;
}

export interface Leader extends RecordMeta {
  slug: string;
  name: string;
  role: string;
  term: string | null;
  bio: string | null;
  media: MediaRef | null;
}

export interface Report extends RecordMeta {
  slug: string;
  title: string;
  kind: "governance" | "financial" | "impact";
  /** Reporting period, e.g. { start: "2024-01-01", end: "2024-12-31" }. */
  period: { start: string; end: string };
  description: string;
  /**
   * File under /public, e.g. "/reports/2024-annual-report.pdf". The download is offered only when the
   * file actually exists at build time.
   */
  file: string | null;
}

export interface AlbumPhoto {
  media: MediaRef;
  caption: string | null;
}

export interface GalleryAlbum extends RecordMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: PartialDate | null;
  cover: MediaRef;
  photos: AlbumPhoto[];
}

export interface SocialLink extends RecordMeta {
  platform: "facebook" | "instagram" | "youtube" | "x" | "linkedin" | "whatsapp";
  label: string;
  url: string;
}

/** A block of reviewed long-form copy (history, policies). */
export interface CopyBlock extends RecordMeta {
  id: string;
  heading: string;
  paragraphs: string[];
}

/* ── Header (Prompt 3) ───────────────────────────────────────────── */

export interface NavGroup {
  heading: string;
  links: LinkItem[];
}

/** Desktop dropdown panels opened from the main row. Menu and search are separate controls. */
export type DropdownId = "programs" | "events";

export interface PrimaryNavItem {
  id: string;
  label: string;
  href: string;
  panel?: DropdownId;
}

/** A card in the Events panel: a real event record, or an honest status card for an empty slot. */
export type EventCardView =
  | {
      kind: "event";
      slug: string;
      title: string;
      href: string;
      /** e.g. "December 2018 · Past event" */
      meta: string;
      media: ResolvedMedia;
    }
  | {
      kind: "status";
      title: string;
      text: string;
      action: LinkItem;
    };

/** Everything the header needs, resolved on the server from content records. */
export interface HeaderData {
  siteName: string;
  utility: { text: string; links: LinkItem[] };
  nav: PrimaryNavItem[];
  donate: LinkItem;
  programs: { label: string; links: LinkItem[]; media: ResolvedMedia; viewAll: LinkItem };
  events: { label: string; invitation: string; allEvents: LinkItem; cards: EventCardView[] };
  menu: {
    label: string;
    feature: LinkItem[];
    columns: NavGroup[];
    social: { label: string; links: LinkItem[]; emptyText: string };
  };
  search: { label: string; suggestions: LinkItem[]; index: SearchEntry[] };
}

/** Forms that open as dialogs (with a page fallback at /contact). */
export type DialogId = "contact" | "newsletter";

export interface FooterLink extends LinkItem {
  /** Opens this dialog in place; `href` remains the no-JS fallback. */
  dialog?: DialogId;
}

export interface FooterColumn {
  heading: string;
  /** Plain-text lines shown above the links. */
  lines?: string[];
  links: FooterLink[];
}

/** An impact/causes panel: default shows the photograph; active replaces it with body/action or links. */
export interface RevealPanelContent {
  id: string;
  title: string;
  body?: string;
  action?: LinkItem;
  links?: LinkItem[];
  media: ResolvedMedia;
}

export interface VideoSource {
  src: string;
  type: string;
}
