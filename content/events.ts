import { media } from "./media";
import { meta } from "./meta";
import type { EventRecord } from "./types";

/**
 * Categories offered by the events filter. Only categories used by published events appear in the
 * filter, so adding a name here does not create an empty option.
 */
export const eventCategories = ["Convention", "Meeting", "Cultural", "Community", "Fundraiser"] as const;

/**
 * Club events.
 *
 * Adding an announced event (club staff): copy a record below, set `historical: false`, and fill
 * `schedule` only with the confirmed local date/time and its time zone ("America/Chicago" for
 * Louisiana, "Africa/Lagos" for Lagos). Set `rsvp` to `{ enabled: true, capacity: null,
 * maxPartySize: 4, closes: null }` to open RSVPs; a numeric capacity is enforced only when a data store
 * is configured (see README → Services). Never add recurring meetings or dates the club has not
 * announced. Past events move to the archive automatically once they end.
 */
export const events: EventRecord[] = [
  {
    kind: "event",
    slug: "inauguration-and-eci-quarterly-meeting-2018",
    title: "Inauguration and ECI quarterly meeting",
    excerpt:
      "Members gathered for an Eko Club Louisiana inauguration held alongside an Eko Club International quarterly meeting.",
    body: [
      "In December 2018, members of Eko Club Louisiana gathered for an inauguration held alongside an Eko Club International (ECI) quarterly meeting. The occasion is recorded on the stage banner in the group photograph taken on the day.",
    ],
    date: { value: "2018-12", precision: "month" },
    historical: true,
    category: "Meeting",
    location: null,
    schedule: null,
    rsvp: null,
    media: { asset: "eclGroup2018", focal: { x: 50, y: 50 } },
    ...meta(
      {
        source: "photo-evidence",
        url: "https://ekoclublouisiana.org/wp-content/uploads/2021/08/group-pic.png",
        note: "Title and month read from the stage banner in the group photograph.",
      },
      {
        verified: false,
        notes: [
          "Confirm the exact date (the day is not legible on the banner), the venue, and what was inaugurated.",
        ],
      },
    ),
  },
  {
    kind: "event",
    slug: "2021-eci-biennial-convention",
    title: "2021 ECI Biennial Convention",
    excerpt:
      "An archived notice of the 2021 Eko Club International biennial convention, announced on the club's previous website as coming up in Louisiana.",
    body: [
      "Eko Club Louisiana's previous website announced the 2021 Eko Club International (ECI) biennial convention as coming up in Louisiana.",
      "This page keeps that announcement as part of the club's record. The convention's dates, venue and programme have not yet been confirmed for this archive.",
    ],
    date: { value: "2021", precision: "year" },
    historical: true,
    category: "Convention",
    location: "Louisiana",
    schedule: null,
    rsvp: null,
    media: media.crest,
    ...meta(
      {
        source: "ekoclublouisiana.org",
        url: "https://ekoclublouisiana.org/2021-eci-biennial-convention-coming-up-in-louisiana/",
        note: "Title and location from the old article's address (Prompt 9). Prompt 2: the 2021 convention is historical.",
      },
      {
        verified: false,
        notes: [
          "Historical only: never present as upcoming.",
          "Confirm host, venue, dates and description, and supply photographs.",
        ],
      },
    ),
  },
];
