import { createHash, randomBytes } from "node:crypto";

import { eventWhenLine, getEvent, rsvpState } from "@/content/event-view";
import { validateRsvp } from "@/lib/forms";
import { deliver, isDeliveryConfigured } from "@/lib/server/deliver";
import { clean, clientIp, filledHoneypot, isCrossSite, json, readJsonObject } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { getStore } from "@/lib/server/store";

const KEEP = 60 * 60 * 24 * 120;

/** Short, readable reference shown to the guest and sent to the RSVP service. */
const confirmationCode = () => `ECL-${randomBytes(4).toString("hex").toUpperCase().slice(0, 6)}`;

/**
 * Event RSVP. Validates against the event's own RSVP settings, then forwards the reply to
 * RSVP_WEBHOOK_URL (or FORMS_WEBHOOK_URL). The confirmation is shown only after that service accepts it.
 * With a data store configured it also prevents duplicate replies and enforces `capacity`; an event
 * with a capacity but no store cannot take RSVPs, rather than risk overbooking.
 */
export async function POST(request: Request) {
  if (isCrossSite(request)) return json({ ok: false, error: "forbidden" }, 403);

  const limited = await rateLimit(`rsvp:${clientIp(request)}`, 8, 600);
  if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429, { "Retry-After": String(limited.retryAfter) });

  const body = await readJsonObject(request, 4096);
  if (!body.ok) return body.response;
  const data = body.data;
  if (filledHoneypot(data)) return json({ ok: true, confirmation: confirmationCode(), party: 1 });

  const event = typeof data.event === "string" ? getEvent(data.event) : undefined;
  if (!event?.rsvp) return json({ ok: false, error: "not_found" }, 404);
  const state = rsvpState(event, new Date());
  if (!state.open) return json({ ok: false, error: "closed" }, 409);

  const errors = validateRsvp(data, event.rsvp.maxPartySize);
  if (Object.keys(errors).length) return json({ ok: false, error: "invalid", errors }, 400);

  const store = getStore();
  const capacity = event.rsvp.capacity;
  if (!isDeliveryConfigured("rsvp") || (capacity !== null && !store)) {
    return json({ ok: false, error: "not_configured" }, 503);
  }

  const email = clean(data.email, 254).toLowerCase();
  const party = Number(data.party);
  const guestKey = `rsvp:${event.slug}:guest:${createHash("sha256").update(email).digest("hex").slice(0, 32)}`;
  const countKey = `rsvp:${event.slug}:count`;
  let reserved = false;

  try {
    if (store) {
      if (!(await store.set(guestKey, "1", { ttlSeconds: KEEP, nx: true }))) {
        return json({ ok: false, error: "duplicate" }, 409);
      }
      if (capacity !== null) {
        const total = await store.incrBy(countKey, party, KEEP);
        reserved = true;
        if (total > capacity) {
          await store.incrBy(countKey, -party);
          await store.del(guestKey);
          return json({ ok: false, error: "full", remaining: Math.max(0, capacity - (total - party)) }, 409);
        }
      }
    }

    const confirmation = confirmationCode();
    const result = await deliver("rsvp", {
      event: event.slug,
      eventTitle: event.title,
      eventWhen: eventWhenLine(event),
      name: clean(data.name, 100),
      email,
      party,
      confirmation,
    });

    if (!result.ok) {
      // Release the place so a failed hand-off does not count against capacity.
      if (store) {
        if (reserved) await store.incrBy(countKey, -party);
        await store.del(guestKey);
      }
      return json({ ok: false, error: result.error }, result.error === "not_configured" ? 503 : 502);
    }
    return json({ ok: true, confirmation, party });
  } catch {
    return json({ ok: false, error: "store_unavailable" }, 503);
  }
}
