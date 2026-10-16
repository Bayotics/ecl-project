// Wall-clock time in a named zone ↔ UTC, without a date library. Event times are stored as local
// "YYYY-MM-DDTHH:mm" plus an IANA zone, so daylight-saving changes (Central Time) are handled by the
// platform's time-zone data rather than by fixed offsets.

export interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

const partsFormatters = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string) {
  let formatter = partsFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    partsFormatters.set(timeZone, formatter);
  }
  return formatter;
}

/** The wall-clock reading of `date` in `timeZone`. */
export function zonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = Object.fromEntries(partsFormatter(timeZone).formatToParts(date).map((p) => [p.type, p.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function parseLocal(local: string): ZonedParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!match) throw new Error(`Expected local time "YYYY-MM-DDTHH:mm", got "${local}"`);
  const [, year, month, day, hour, minute] = match.map(Number);
  return { year, month, day, hour, minute };
}

const asUtcMs = (p: ZonedParts) => Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);

/** Converts a local "YYYY-MM-DDTHH:mm" in `timeZone` to the instant it denotes. */
export function zonedToUtc(local: string, timeZone: string): Date {
  const wanted = parseLocal(local);
  const target = asUtcMs(wanted);
  // First guess treats the wall time as UTC; correct by the zone's offset at that instant, then once
  // more in case the correction crossed a daylight-saving boundary.
  let instant = target;
  for (let i = 0; i < 2; i++) {
    const offset = asUtcMs(zonedParts(new Date(instant), timeZone)) - instant;
    instant = target - offset;
  }
  return new Date(instant);
}

const ZONE_LABEL: Record<string, string> = {
  "America/Chicago": "Central Time",
  "Africa/Lagos": "Lagos time",
};

/** "CDT"/"CST" for Central Time; "WAT" for Lagos (the platform reports Lagos as "GMT+1"). */
export function zoneAbbreviation(date: Date, timeZone: string): string {
  if (timeZone === "Africa/Lagos") return "WAT";
  const name = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" })
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName");
  return name?.value ?? timeZone;
}

export const zoneLabel = (timeZone: string) => ZONE_LABEL[timeZone] ?? timeZone;

/** "Saturday, March 14, 2026" in the event's own zone. */
export function formatZonedDay(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/** "6:00 PM" in the event's own zone. */
export function formatZonedTime(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" }).format(date);
}

/** iCalendar UTC stamp, e.g. "20260314T230000Z". */
export function icsStamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
