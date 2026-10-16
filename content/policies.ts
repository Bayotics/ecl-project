import { DRAFT, meta } from "./meta";
import { settings } from "./site";
import type { RecordMeta } from "./types";

/**
 * Privacy and cookie notices. The text is generated from the services this deployment actually has
 * switched on (lib/server/services.ts), so it never describes a system that is not running.
 * Draft until the club (and, ideally, its adviser) reviews it; the pages say so while it is a draft.
 */
export const policyReview: RecordMeta & { updated: string } = {
  updated: "2026-10-15",
  ...meta(DRAFT, {
    verified: false,
    notes: [
      "Privacy and cookie notices are drafts written to match the configured system; the club must review them before launch.",
      "Name the actual form service, newsletter provider and data-store provider once chosen.",
    ],
  }),
};

export interface PolicySection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

interface Services {
  forms: Record<"contact" | "newsletter" | "membership" | "volunteer" | "rsvp", boolean>;
  store: string | null;
  donations: boolean;
  analytics: string | null;
}

const active = (on: boolean) => (on ? "" : " This form is not yet connected on this website, so it does not currently send anything.");

export function privacySections(services: Services): PolicySection[] {
  const { email } = settings.contact;
  return [
    {
      heading: "Who we are",
      paragraphs: [
        `${settings.name} is a nonprofit sociocultural community based in ${settings.contact.location}. Questions about this notice or your information can be sent to ${email}.`,
      ],
    },
    {
      heading: "What we collect, and why",
      paragraphs: ["The website collects personal information only when you choose to send it through a form:"],
      list: [
        `Contact form: your name, email, topic and message, so the club can reply.${active(services.forms.contact)}`,
        `Newsletter: your email, optional name and your consent, so the club can send you updates. You can unsubscribe at any time.${active(services.forms.newsletter)}`,
        `Membership request: your name and email, and optionally your phone, city, interests and a message, so the club can follow up. Sending it is a request, not membership.${active(services.forms.membership)}`,
        `Volunteer form: your name and email, and optionally your phone, interests, availability and a message, so the club can contact you about volunteering.${active(services.forms.volunteer)}`,
        `Event RSVP: your name, email and the number attending, so the club can plan the event.${active(services.forms.rsvp)}`,
      ],
    },
    {
      heading: "Where it goes",
      paragraphs: [
        "Form submissions are passed straight to the service the club uses to receive them (for example its email or spreadsheet service). The website itself does not keep a copy, and submissions are never published or included in the site's search.",
        services.store
          ? "To run RSVPs and donations safely, the website keeps a few technical records without your name or message: RSVP counts, a one-way scrambled code of the email address used for an RSVP (to prevent duplicates), donation status (amount and whether it was paid), and short-lived counters of requests per network address to block abuse."
          : "The website does not currently keep any records of its own.",
      ],
    },
    {
      heading: "Donations",
      paragraphs: services.donations
        ? [
            "Donations are processed by Stripe on its own secure checkout page. Stripe collects your payment and billing details under its own privacy policy; the club never sees or stores your card details. The website records only the amount, frequency and designation of your gift and whether Stripe confirmed the payment.",
          ]
        : ["Online donations are not currently enabled on this website."],
    },
    {
      heading: "Analytics",
      paragraphs: services.analytics
        ? [
            `The website uses ${services.analytics}, which counts visits without cookies and without collecting personal information. It records pages viewed, referring sites, device type and country, in aggregate.`,
          ]
        : ["The website does not currently use analytics."],
    },
    {
      heading: "Your choices",
      paragraphs: [
        `You can ask the club what information it holds about you, ask for it to be corrected or deleted, or withdraw your consent to email updates, by writing to ${email}.`,
      ],
    },
  ];
}

export function cookieSections(services: Services): PolicySection[] {
  return [
    {
      heading: "Cookies on this website",
      paragraphs: [
        "This website does not set cookies of its own, and it does not use advertising or tracking cookies. It does not store anything in your browser's local storage.",
        services.analytics
          ? `Visit counts come from ${services.analytics}, which works without cookies.`
          : "No analytics service is in use.",
      ],
    },
    {
      heading: "Other sites",
      paragraphs: [
        services.donations
          ? "When you choose to donate, you move to Stripe's secure checkout page, which sets the cookies it needs for payment and fraud prevention under Stripe's own cookie policy."
          : "Online donations are not currently enabled, so no payment provider is involved.",
        "Share links open the chosen site (for example Facebook or WhatsApp) only when you click them; nothing from those sites loads before then.",
      ],
    },
  ];
}
