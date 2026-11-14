import { consumeToken, setSession } from "@/lib/auth/session";
import { collection, database } from "@/lib/db/mongo";

/** Link from the confirmation email: confirms the address, signs the member in, opens the member area. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const db = await database();
  const userId = db ? await consumeToken(url.searchParams.get("token") ?? "", "confirm") : null;
  if (!db || !userId) return Response.redirect(new URL("/login?confirm=invalid", url), 303);
  const now = new Date().toISOString();
  await collection(db, "users").updateOne({ id: userId }, { $set: { email_confirmed_at: now, updated_at: now } });
  await setSession(userId);
  return Response.redirect(new URL("/member", url), 303);
}
