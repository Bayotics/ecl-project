import type { EventRecord, MediaRef } from "@/content/types";
import type { Event } from "./types";
export const meta = { status: "published" as const, provenance: { source: "club-supplied" as const }, review: { verified: true, notes: [] } };
export function managedMedia(url: string, alt: string): MediaRef {
  return { asset: "eclCrest", alt, ...(url ? { remote: { src: url, width: 1600, height: 1067 } } : {}) };
}
function localTime(value: string) {
  const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: "America/Chicago", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(value));
  return parts.replace(" ", "T");
}
export function mapEvent(row: Event): EventRecord {
  return { ...meta, managedId: row.id, kind: "event", slug: row.slug, title: row.title, excerpt: row.description.slice(0, 220),
    body: row.description.split(/\n\s*\n/).filter(Boolean), date: { value: localTime(row.start_at).slice(0,10), precision: "day" },
    historical: false, category: row.category, location: [row.venue, row.address].filter(Boolean).join(", "),
    schedule: { start: localTime(row.start_at), end: localTime(row.end_at), timeZone: "America/Chicago" },
    rsvp: { enabled: row.rsvp_enabled, capacity: row.capacity, maxPartySize: 1, closes: localTime(row.start_at) },
    media: managedMedia(row.image_url, row.title) };
}
