import Form from "next/form";
import Link from "next/link";

import { MediaImage } from "@/components/ui/MediaImage";
import { DialogLink } from "@/components/forms/DialogLink";
import {
  eventDayKey,
  eventHref,
  eventStatus,
  eventWhen,
  eventYear,
  isUpcoming,
  sortEvents,
  statusLabel,
} from "@/content/event-view";
import { resolveMedia } from "@/content/media";
import type { EventRecord } from "@/content/types";
import { zonedParts } from "@/lib/time";
import { cx } from "@/lib/cx";

import styles from "./events.module.css";

export type EventsWhen = "upcoming" | "past";
export type EventsView = "list" | "calendar";

export interface EventsQuery {
  when: EventsWhen;
  view: EventsView;
  category: string;
  year: string;
  /** "YYYY-MM" for the calendar. */
  month: string;
}

/** Builds an /events URL, leaving defaults out so links stay short. */
export function eventsUrl(query: Partial<EventsQuery>): string {
  const params = new URLSearchParams();
  if (query.when && query.when !== "upcoming") params.set("when", query.when);
  if (query.view && query.view !== "list") params.set("view", query.view);
  if (query.category) params.set("category", query.category);
  if (query.year) params.set("year", query.year);
  if (query.view === "calendar" && query.month) params.set("month", query.month);
  const qs = params.toString();
  return qs ? `/events?${qs}` : "/events";
}

const MONTH_KEY = /^(\d{4})-(0[1-9]|1[0-2])$/;
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthName = (year: number, month: number) =>
  new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(Date.UTC(year, month - 1, 1));

/** Reads and sanitizes the query string against the published events. */
export function parseEventsQuery(raw: Record<string, string | string[] | undefined>, categories: string[]): EventsQuery {
  const one = (key: string) => (typeof raw[key] === "string" ? (raw[key] as string) : "");
  return {
    when: one("when") === "past" ? "past" : "upcoming",
    view: one("view") === "calendar" ? "calendar" : "list",
    category: categories.includes(one("category")) ? one("category") : "",
    year: /^\d{4}$/.test(one("year")) ? one("year") : "",
    month: MONTH_KEY.test(one("month")) ? one("month") : "",
  };
}

interface EventsBrowserProps {
  events: EventRecord[];
  query: EventsQuery;
  now: Date;
}

export function EventsBrowser({ events, query, now }: EventsBrowserProps) {
  const inTab = events.filter((event) => (query.when === "upcoming" ? isUpcoming(event, now) : !isUpcoming(event, now)));
  const sorted = sortEvents(inTab, query.when === "upcoming" ? "asc" : "desc");
  const categories = [...new Set(inTab.map((event) => event.category))].sort();
  const years = [...new Set(inTab.map(eventYear).filter((y): y is number => y !== null))].sort((a, b) => b - a);
  const filtered = sorted.filter(
    (event) => (!query.category || event.category === query.category) && (!query.year || String(eventYear(event)) === query.year),
  );
  const filtering = Boolean(query.category || query.year);
  const counts = {
    upcoming: events.filter((event) => isUpcoming(event, now)).length,
    past: events.filter((event) => !isUpcoming(event, now)).length,
  };

  return (
    <div className={styles.browser}>
      <div className={styles.toolbar}>
        <nav aria-label="Upcoming or past events" className={styles.tabs}>
          {(["upcoming", "past"] as const).map((when) => (
            <Link
              key={when}
              href={eventsUrl({ when, view: query.view })}
              className={styles.tab}
              aria-current={query.when === when ? "page" : undefined}
            >
              {when === "upcoming" ? "Upcoming" : "Past"} <span className={styles.count}>{counts[when]}</span>
            </Link>
          ))}
        </nav>
        <nav aria-label="Display" className={styles.views}>
          {(["list", "calendar"] as const).map((view) => (
            <Link
              key={view}
              href={eventsUrl({ ...query, view })}
              className={styles.viewLink}
              aria-current={query.view === view ? "page" : undefined}
            >
              {view === "list" ? "List" : "Calendar"}
            </Link>
          ))}
        </nav>
      </div>

      {inTab.length ? (
        <Form action="/events" className={styles.filters} aria-label="Filter events">
          {query.when !== "upcoming" ? <input type="hidden" name="when" value={query.when} /> : null}
          {query.view !== "list" ? <input type="hidden" name="view" value={query.view} /> : null}
          <label className={styles.filter}>
            <span className={styles.filterLabel}>Category</span>
            <select name="category" defaultValue={query.category} className={styles.select}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.filter}>
            <span className={styles.filterLabel}>Year</span>
            <select name="year" defaultValue={query.year} className={styles.select}>
              <option value="">All years</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className={styles.apply}>
            Apply
          </button>
          {filtering ? (
            <Link href={eventsUrl({ when: query.when, view: query.view })} className={styles.clear}>
              Clear filters
            </Link>
          ) : null}
        </Form>
      ) : null}

      <p className={styles.summary} role="status">
        {summaryText(filtered.length, query)}
      </p>

      {!inTab.length ? (
        <EmptyTab when={query.when} />
      ) : !filtered.length ? (
        <div className={styles.empty}>
          <p>No {query.when} events match these filters.</p>
          <Link href={eventsUrl({ when: query.when, view: query.view })} className={styles.clear}>
            Clear filters
          </Link>
        </div>
      ) : query.view === "calendar" ? (
        <EventCalendar events={filtered} query={query} now={now} />
      ) : (
        <EventList events={filtered} now={now} />
      )}
    </div>
  );
}

function summaryText(count: number, query: EventsQuery): string {
  const noun = `${query.when} event${count === 1 ? "" : "s"}`;
  const parts = [query.category, query.year].filter(Boolean).join(", ");
  return `${count} ${noun}${parts ? ` (${parts})` : ""}`;
}

function EmptyTab({ when }: { when: EventsWhen }) {
  return when === "upcoming" ? (
    <div className={styles.empty}>
      <p>No upcoming events have been announced yet. New events appear here as soon as the club confirms them.</p>
      <div className={styles.emptyActions}>
        <DialogLink dialog="newsletter" href="/contact#newsletter" className={styles.clear}>
          Get updates by email
        </DialogLink>
        <Link href={eventsUrl({ when: "past" })} className={styles.clear}>
          See past events
        </Link>
      </div>
    </div>
  ) : (
    <div className={styles.empty}>
      <p>No past events have been published yet.</p>
    </div>
  );
}

function EventList({ events, now }: { events: EventRecord[]; now: Date }) {
  return (
    <ul role="list" className={styles.list}>
      {events.map((event) => {
        const when = eventWhen(event);
        const status = eventStatus(event, now);
        return (
          <li key={event.slug}>
            <article className={styles.row}>
              <div className={styles.rowMedia}>
                <MediaImage media={resolveMedia(event.media)} decorative sizes="(min-width: 768px) 16vw, 92vw" className={styles.rowImage} />
              </div>
              <div className={styles.rowBody}>
                <p className={styles.meta}>
                  <span className={styles.badge} data-status={status}>
                    {statusLabel[status]}
                  </span>
                  <span>{event.category}</span>
                </p>
                <h3 className={styles.rowTitle}>
                  <Link href={eventHref(event.slug)} className={styles.rowLink}>
                    {event.title}
                  </Link>
                </h3>
                <p className={styles.when}>
                  <span>{when.day}</span>
                  {when.time ? <span>{when.time}</span> : null}
                  {event.location ? <span>{event.location}</span> : null}
                </p>
                <p className={styles.excerpt}>{event.excerpt}</p>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

function EventCalendar({ events, query, now }: { events: EventRecord[]; query: EventsQuery; now: Date }) {
  const dated = events.filter((event) => eventDayKey(event));
  const undated = events.filter((event) => !eventDayKey(event));

  // Default month: the first event shown (soonest upcoming, latest past), else this month in Louisiana.
  const fallback = dated[0] ? eventDayKey(dated[0])!.slice(0, 7) : (() => {
    const p = zonedParts(now, "America/Chicago");
    return `${p.year}-${String(p.month).padStart(2, "0")}`;
  })();
  const monthKey = query.month || fallback;
  const [year, month] = monthKey.split("-").map(Number);
  const first = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const lead = first.getUTCDay();
  const cells: Array<number | null> = [...Array(lead).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));

  const byDay = new Map<number, EventRecord[]>();
  for (const event of dated) {
    const key = eventDayKey(event)!;
    if (key.slice(0, 7) !== monthKey) continue;
    const day = Number(key.slice(8, 10));
    byDay.set(day, [...(byDay.get(day) ?? []), event]);
  }

  const shift = (delta: number) => {
    const d = new Date(Date.UTC(year, month - 1 + delta, 1));
    return { key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`, name: monthName(d.getUTCFullYear(), d.getUTCMonth() + 1) };
  };
  const prev = shift(-1);
  const next = shift(1);
  const title = monthName(year, month);

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHead}>
        <h3 className={styles.monthTitle} id="calendar-month">
          {title}
        </h3>
        <div className={styles.monthNav}>
          <Link href={eventsUrl({ ...query, month: prev.key })} className={styles.viewLink} aria-label={`Previous month, ${prev.name}`}>
            Previous
          </Link>
          <Link href={eventsUrl({ ...query, month: next.key })} className={styles.viewLink} aria-label={`Next month, ${next.name}`}>
            Next
          </Link>
        </div>
      </div>
      <table className={styles.grid} aria-labelledby="calendar-month">
        <thead>
          <tr>
            {WEEKDAYS.map((day) => (
              <th key={day} scope="col">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, w) => (
            <tr key={w}>
              {week.map((day, d) => (
                <td key={d} className={cx(!day && styles.outside, !!day && byDay.has(day) && styles.hasEvent)}>
                  {day ? (
                    <>
                      <span className={styles.dayNumber}>{day}</span>
                      {byDay.get(day)?.map((event) => (
                        <Link key={event.slug} href={eventHref(event.slug)} className={styles.dayEvent}>
                          {event.title}
                        </Link>
                      ))}
                    </>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!byDay.size ? <p className={styles.summary}>No events with a confirmed date in {title}.</p> : null}
      {undated.length ? (
        <div className={styles.undated}>
          <h3 className={styles.filterLabel}>Exact day not confirmed</h3>
          <ul role="list" className={styles.undatedList}>
            {undated.map((event) => (
              <li key={event.slug}>
                <Link href={eventHref(event.slug)}>{event.title}</Link> <span>{eventWhen(event).day}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
