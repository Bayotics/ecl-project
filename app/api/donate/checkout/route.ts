import { createHash } from "node:crypto";

import { donationSettings } from "@/content/donations";
import { donationAvailability, recordDonation, validateDonation } from "@/lib/server/donations";
import { clientIp, isCrossSite, json, readJsonObject, siteOrigin } from "@/lib/server/http";
import { rateLimit } from "@/lib/server/rate-limit";
import { createCheckoutSession, stripeConfig } from "@/lib/server/stripe";

/**
 * Starts a donation: validates amount/currency/frequency/designation against content/donations.ts,
 * creates a Stripe hosted Checkout Session (idempotent per attempt) and returns its URL. The donation is
 * recorded as "pending"; only the signed webhook can mark it paid.
 */
export async function POST(request: Request) {
  if (isCrossSite(request)) return json({ ok: false, error: "forbidden" }, 403);

  const limited = await rateLimit(`donate:${clientIp(request)}`, 10, 600);
  if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429, { "Retry-After": String(limited.retryAfter) });

  const availability = donationAvailability();
  const { config } = stripeConfig();
  if (!availability.available || !config) return json({ ok: false, error: "not_configured" }, 503);

  const body = await readJsonObject(request, 2048);
  if (!body.ok) return body.response;

  const { errors, amount, frequency, designation } = validateDonation(body.data, availability.recurring);
  if (Object.keys(errors).length || !designation) return json({ ok: false, error: "invalid", errors }, 400);

  // The browser sends a random id per donation attempt; folding the gift details into the key means a
  // changed amount gets a new session while a double-click or retry reuses the first one.
  const attempt = typeof body.data.attempt === "string" && /^[A-Za-z0-9-]{16,64}$/.test(body.data.attempt) ? body.data.attempt : null;
  if (!attempt) return json({ ok: false, error: "invalid" }, 400);
  const idempotencyKey = createHash("sha256")
    .update([attempt, amount, donationSettings.currency, frequency, designation.id].join("|"))
    .digest("hex");

  const origin = siteOrigin(request);
  const session = await createCheckoutSession(config, {
    amountCents: amount * 100,
    currency: donationSettings.currency,
    frequency,
    designation,
    idempotencyKey,
    successUrl: `${origin}/donate/thank-you?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/donate?checkout=canceled`,
    productName: frequency === "monthly" ? "Monthly gift to Eko Club Louisiana" : "Gift to Eko Club Louisiana",
  });
  if (!session.ok) return json({ ok: false, error: "provider_error" }, 502);

  try {
    await recordDonation(session.id, {
      status: "pending",
      amountCents: amount * 100,
      currency: donationSettings.currency,
      frequency,
      designation: designation.id,
    });
  } catch {
    return json({ ok: false, error: "store_unavailable" }, 503);
  }

  return json({ ok: true, url: session.url });
}
