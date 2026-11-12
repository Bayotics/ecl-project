import { publicEvent } from "@/lib/supabase/content";
import { eventHref, eventInstants } from "@/content/event-view";
import { settings } from "@/content/site";
import { icsStamp } from "@/lib/time";

/** RFC 5545 text escaping. */
const escape = (value: string) => value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Lines longer than 75 octets are folded with CRLF + space. */
function fold(line: string): string {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  out.push(rest);
  return out.join("\r\n");
}

/**
 * Calendar file for one event. Exists only when the club has confirmed a date and time; times are
 * written in UTC, so calendar apps show them correctly in any zone, across daylight-saving changes.
 */
export async function GET(_request: Request, ctx: RouteContext<"/events/[slug]/calendar.ics">) {
  const { slug } = await ctx.params;
  const event = await publicEvent(slug);
  const instants = event ? eventInstants(event) : null;
  if (!event || !instants) return new Response("Not found", { status: 404 });

  const url = new URL(eventHref(event.slug), settings.url).toString();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Eko Club Louisiana//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.slug}@${new URL(settings.url).host}`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(instants.start)}`,
    ...(instants.end ? [`DTEND:${icsStamp(instants.end)}`] : []),
    `SUMMARY:${escape(event.title)}`,
    `DESCRIPTION:${escape(`${event.excerpt}\n\n${url}`)}`,
    ...(event.location ? [`LOCATION:${escape(event.location)}`] : []),
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return new Response(`${lines.map(fold).join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.slug}.ics"`,
      "Cache-Control": "public, max-age=900",
    },
  });
}
