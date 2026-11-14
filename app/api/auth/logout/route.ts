import { clearSession } from "@/lib/auth/session";
import { isCrossSite, json } from "@/lib/server/http";

export async function POST(request: Request) {
  if (isCrossSite(request)) return json({ ok: false }, 403);
  await clearSession();
  return json({ ok: true });
}
