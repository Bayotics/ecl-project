import { randomUUID } from "node:crypto";

import { collection, requireDatabase } from "@/lib/db/mongo";
import { ApiError, handle, text } from "@/lib/server/api";

/** GET ?event=<id>: whether the signed-in member is attending. */
export async function GET(request: Request) {
  return handle(request, { auth: "member" }, async ({ user }) => {
    const eventId = new URL(request.url).searchParams.get("event") ?? "";
    const rsvp = await collection(await requireDatabase(), "event_rsvps").findOne({ event_id: eventId, user_id: user!.id });
    return { going: rsvp?.status === "going" };
  });
}

/** POST { eventId, going }: reserve or cancel a place, respecting the event's RSVP settings and capacity. */
export async function POST(request: Request) {
  return handle(request, { body: 1024, auth: "member", limit: ["member-rsvp", 30, 600] }, async ({ data, user }) => {
    const eventId = text(data.eventId, 64);
    const going = data.going === true;
    const db = await requireDatabase();
    const event = await collection(db, "events").findOne({ id: eventId, published: true });
    if (!event) throw new ApiError("This event is not available.", 404);
    if (!event.rsvp_enabled) throw new ApiError("RSVPs are not open for this event.");
    if (new Date(event.end_at) < new Date()) throw new ApiError("This event has ended.");

    const rsvps = collection(db, "event_rsvps");
    if (going && event.capacity != null) {
      const taken = await rsvps.countDocuments({ event_id: eventId, status: "going", user_id: { $ne: user!.id } });
      if (taken >= event.capacity) throw new ApiError("This event is full.", 409);
    }
    const now = new Date().toISOString();
    const id = randomUUID();
    await rsvps.updateOne(
      { event_id: eventId, user_id: user!.id },
      { $set: { status: going ? "going" : "cancelled", updated_at: now }, $setOnInsert: { _id: id, id, event_id: eventId, user_id: user!.id, created_at: now } },
      { upsert: true },
    );
    return { going };
  });
}
