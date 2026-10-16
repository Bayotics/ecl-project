// Derived facts about events: timing, status and RSVP availability. Everything is computed from the
// records in content/events.ts, so "upcoming" and "past" stay correct as time passes.
import { formatZonedDay, formatZonedTime, zoneAbbreviation, zoneLabel, zonedToUtc } from "@/lib/time";

import { events } from "./events";
import { formatPartialDate, published } from "./meta";
import type { EventRecord } from "./types";

export const eventHref = (slug: string) => `/events/${slug}`;

export interface EventInstants {
  start: Date;
  end: Date | null;
}

export function eventInstants(event: EventRecord): EventInstants | null {
  if (!event.schedule) return null;
  const { start, end, timeZone } = event.schedule;
  return { start: zonedToUtc(start, timeZone), end: end ? zonedToUtc(end, timeZone) : null };
}

/** Historical records are always past; scheduled events are past once they end; unscheduled announced events are upcoming. */
export function isUpcoming(event: EventRecord, now: Date): boolean {
  if (event.historical) return false;
  const instants = eventInstants(event);
  if (!instants) return true;
  return (instants.end ?? instants.start).getTime() > now.getTime();
}

export type EventStatus = "upcoming" | "past" | "archive";

export function eventStatus(event: EventRecord, now: Date): EventStatus {
  if (event.historical) return "archive";
  return isUpcoming(event, now) ? "upcoming" : "past";
}

export const statusLabel: Record<EventStatus, string> = { upcoming: "Upcoming", past: "Past event", archive: "Archive" };

/** Day line, time line and zone, each in the event's own time zone. */
export function eventWhen(event: EventRecord): { day: string; time: string | null; zone: string | null } {
  const instants = eventInstants(event);
  if (instants && event.schedule) {
    const { timeZone } = event.schedule;
    const start = formatZonedTime(instants.start, timeZone);
    const end = instants.end ? formatZonedTime(instants.end, timeZone) : null;
    const abbr = zoneAbbreviation(instants.start, timeZone);
    return {
      day: formatZonedDay(instants.start, timeZone),
      time: `${end ? `${start} – ${end}` : start} ${abbr}`,
      zone: zoneLabel(timeZone),
    };
  }
  if (event.date) return { day: formatPartialDate(event.date), time: null, zone: null };
  return { day: "Date to be confirmed", time: null, zone: null };
}

/** One-line summary for cards: "Saturday, March 14, 2026 · 6:00 PM CDT". */
export function eventWhenLine(event: EventRecord): string {
  const when = eventWhen(event);
  return when.time ? `${when.day} · ${when.time}` : when.day;
}

/** Calendar year of the event, for the year filter. */
export function eventYear(event: EventRecord): number | null {
  const value = event.schedule?.start ?? event.date?.value;
  return value ? Number(value.slice(0, 4)) : null;
}

/** Local calendar day "YYYY-MM-DD", only when the day is actually known. */
export function eventDayKey(event: EventRecord): string | null {
  if (event.schedule) return event.schedule.start.slice(0, 10);
  if (event.date?.precision === "day") return event.date.value;
  return null;
}

export interface RsvpState {
  open: boolean;
  /** Why RSVP is closed, for an honest message; null when open. */
  reason: "not-offered" | "past" | "closed" | null;
}

export function rsvpState(event: EventRecord, now: Date): RsvpState {
  if (!event.rsvp?.enabled || !event.schedule) return { open: false, reason: "not-offered" };
  if (!isUpcoming(event, now)) return { open: false, reason: "past" };
  const closes = zonedToUtc(event.rsvp.closes ?? event.schedule.start, event.schedule.timeZone);
  return now < closes ? { open: true, reason: null } : { open: false, reason: "closed" };
}

export const publishedEvents = () => published(events);

export const getEvent = (slug: string) => publishedEvents().find((event) => event.slug === slug);

/** Soonest first for upcoming; most recent first for past. */
export function sortEvents(list: EventRecord[], direction: "asc" | "desc"): EventRecord[] {
  const key = (event: EventRecord) => event.schedule?.start ?? event.date?.value ?? "9999";
  return [...list].sort((a, b) => (direction === "asc" ? 1 : -1) * key(a).localeCompare(key(b)));
}
