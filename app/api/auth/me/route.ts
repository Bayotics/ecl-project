import { currentUser } from "@/lib/auth/session";
import { collection, database } from "@/lib/db/mongo";
import { json } from "@/lib/server/http";

/** The signed-in member (email, role and profile), or `user: null`. */
export async function GET() {
  const user = await currentUser().catch(() => null);
  const db = user ? await database() : null;
  const profile = db && user ? await collection(db, "profiles").findOne({ id: user.id }, { projection: { _id: 0 } }) : null;
  return json({ ok: true, user, profile });
}
