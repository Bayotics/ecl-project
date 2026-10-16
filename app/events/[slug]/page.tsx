import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { pageMetadata } from "@/lib/seo";

import { RsvpForm } from "@/components/forms/RsvpForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { ShareLinks } from "@/components/page/ShareLinks";
import styles from "@/components/page/page.module.css";
import {
  eventHref,
  eventStatus,
  eventWhen,
  eventWhenLine,
  getEvent,
  publishedEvents,
  rsvpState,
  statusLabel,
} from "@/content/event-view";
import { resolveMedia } from "@/content/media";
import { settings } from "@/content/site";
import { eventLd } from "@/lib/structured-data";

export const dynamicParams = false;
// Re-render at most every 15 minutes so an event moves to "past" and RSVPs close on time.
export const revalidate = 900;

export function generateStaticParams() {
  return publishedEvents().map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  return event ? pageMetadata({ title: event.title, description: event.excerpt, path: eventHref(event.slug), image: resolveMedia(event.media) }) : {};
}

export default async function EventPage({ params }: PageProps<"/events/[slug]">) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  const now = new Date();
  const status = eventStatus(event, now);
  const when = eventWhen(event);
  const rsvp = rsvpState(event, now);
  const fallback = { email: settings.contact.email, phone: settings.contact.phone.display };

  const structured = eventLd(event);

  return (
    <article>
      {structured ? <JsonLd data={structured} /> : null}
      <PageIntro label={`${statusLabel[status]} · ${event.category}`} title={event.title} lead={event.excerpt} media={resolveMedia(event.media)} />

      <PageSection id="details" title="Details">
        <dl className={styles.facts}>
          <dt>Date</dt>
          <dd>
            {when.day}
            {!event.schedule && status !== "upcoming" ? <span>Exact date not confirmed</span> : null}
          </dd>
          {when.time ? (
            <>
              <dt>Time</dt>
              <dd>
                {when.time}
                <span>{when.zone}</span>
              </dd>
            </>
          ) : null}
          {event.location ? (
            <>
              <dt>Location</dt>
              <dd>{event.location}</dd>
            </>
          ) : status === "upcoming" ? (
            <>
              <dt>Location</dt>
              <dd>To be confirmed</dd>
            </>
          ) : null}
          <dt>Status</dt>
          <dd>{statusLabel[status]}</dd>
        </dl>
        <div className={styles.prose}>
          {(event.body.length ? event.body : [event.excerpt]).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        {/* Calendar download only when a confirmed date and time exist. */}
        {event.schedule && status === "upcoming" ? (
          <a href={`${eventHref(event.slug)}/calendar.ics`} className={styles.action} download={`${event.slug}.ics`}>
            Add to calendar (.ics)
          </a>
        ) : null}
      </PageSection>

      {event.rsvp?.enabled ? (
        <PageSection id="rsvp" title="RSVP" tone="mist">
          {rsvp.open ? (
            <>
              {event.rsvp.capacity !== null ? <p className={styles.notice}>Places are limited.</p> : null}
              <RsvpForm
                event={{ slug: event.slug, title: event.title, when: eventWhenLine(event) }}
                maxPartySize={event.rsvp.maxPartySize}
                fallback={fallback}
              />
            </>
          ) : (
            <p className={styles.notice}>
              {rsvp.reason === "past" ? "This event has ended." : "RSVPs for this event have closed."}
            </p>
          )}
        </PageSection>
      ) : null}

      <PageSection id="share" title="Share">
        <ShareLinks url={new URL(eventHref(event.slug), settings.url).toString()} title={event.title} />
        <Link href={status === "upcoming" ? "/events" : "/events?when=past"} className={styles.action}>
          {status === "upcoming" ? "All upcoming events" : "All past events"}
        </Link>
      </PageSection>
    </article>
  );
}
