import type { Metadata } from "next";

import { EventsBrowser, parseEventsQuery } from "@/components/events/EventsBrowser";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { publishedEvents } from "@/content/event-view";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: pages.events.label, description: pages.events.description, path: pages.events.href });

/**
 * Upcoming/past tabs, category and year filters, list or month calendar. Everything is driven by the URL,
 * so filtered views can be shared and work without JavaScript. Rendered per request so "upcoming"
 * always reflects the current time.
 */
export default async function EventsPage({ searchParams }: PageProps<"/events">) {
  const events = publishedEvents();
  const query = parseEventsQuery(await searchParams, [...new Set(events.map((event) => event.category))]);

  return (
    <>
      <PageIntro label={pages.events.label} title={pages.events.title} />
      <PageSection id="calendar" title={query.when === "upcoming" ? "Upcoming events" : "Past events"}>
        <p>
          Times are shown where each event takes place: Central Time for Louisiana events (with daylight saving), Lagos
          time for events in Lagos.
        </p>
        <EventsBrowser events={events} query={query} now={new Date()} />
      </PageSection>
    </>
  );
}
