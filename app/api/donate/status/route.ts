import { SESSION_ID, getDonation } from "@/lib/server/donations";
import { clientIp, json } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { getStore } from "@/lib/server/store";

/**
 * Donation status for the thank-you page. Reads only what verified webhooks recorded; the session id in
 * the return URL is used to look the donation up, never as proof of payment.
 */
export async function GET(request: Request) {
  const limited = await rateLimit(`donate-status:${clientIp(request)}`, 60, 300);
  if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429, { "Retry-After": String(limited.retryAfter) });

  if (!getStore()) return json({ ok: false, error: "not_configured" }, 503);

  const id = new URL(request.url).searchParams.get("session_id") ?? "";
  if (!SESSION_ID.test(id)) return json({ ok: false, error: "invalid" }, 400);

  try {
    const donation = await getDonation(id);
    if (!donation) return json({ ok: false, error: "not_found" }, 404);
    const { status, amountCents, currency, frequency } = donation;
    return json({ ok: true, status, amountCents, currency, frequency });
  } catch {
    return json({ ok: false, error: "store_unavailable" }, 503);
  }
}
