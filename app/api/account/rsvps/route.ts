import { collection, requireDatabase, rows } from "@/lib/db/mongo";
import { handle } from "@/lib/server/api";

/** The signed-in member's event responses, newest first, with each published event's title and link. */
export async function GET(request: Request) {
  return handle(request, { auth: "member" }, async ({ user }) => {
    const db = await requireDatabase();
    const responses = await collection(db, "event_rsvps").find({ user_id: user!.id }, { projection: { _id: 0 } }).sort({ created_at: -1 }).toArray();
    const events = await rows(db, "events", { published: true, id: { $in: responses.map((r) => r.event_id) } }, { start_at: 1 });
    return {
      admin: user!.role === "admin",
      responses: responses.map((r) => {
        const event = events.find((e) => e.id === r.event_id);
        return { id: r.id, status: r.status, event: event ? { slug: event.slug, title: event.title } : null };
      }),
    };
  });
}
