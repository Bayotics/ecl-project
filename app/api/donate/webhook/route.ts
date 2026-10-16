import { updateDonation, type DonationStatus } from "@/lib/server/donations";
import { json } from "@/lib/server/http";
import { getStore } from "@/lib/server/store";
import { stripeConfig, verifyStripeSignature } from "@/lib/server/stripe";

interface CheckoutSessionObject {
  id: string;
  payment_status?: "paid" | "unpaid" | "no_payment_required";
  amount_total?: number;
  currency?: string;
  mode?: "payment" | "subscription";
  metadata?: Record<string, string>;
}

/** Checkout events that change what the thank-you page may say. */
function statusFor(type: string, session: CheckoutSessionObject): DonationStatus | null {
  switch (type) {
    case "checkout.session.completed":
      // Bank-debit style methods complete before the money arrives: still processing.
      return session.payment_status === "paid" ? "paid" : "processing";
    case "checkout.session.async_payment_succeeded":
      return "paid";
    case "checkout.session.async_payment_failed":
      return "failed";
    case "checkout.session.expired":
      return "expired";
    default:
      return null;
  }
}

/**
 * Stripe webhook (configure the endpoint as https://<site>/api/donate/webhook with the four
 * checkout.session.* events above). The raw body is verified against STRIPE_WEBHOOK_SECRET before
 * anything is trusted; each event is processed once.
 */
export async function POST(request: Request) {
  const { config } = stripeConfig();
  const store = getStore();
  if (!config || !store) return json({ ok: false, error: "not_configured" }, 503);

  const payload = await request.text();
  if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"), config.webhookSecret)) {
    return json({ ok: false, error: "invalid_signature" }, 400);
  }

  let event: { id?: string; type?: string; data?: { object?: CheckoutSessionObject } };
  try {
    event = JSON.parse(payload);
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }
  const session = event.data?.object;
  if (!event.id || !event.type || !session?.id) return json({ received: true });

  const seenKey = `stripe-event:${event.id}`;
  if (await store.get(seenKey)) return json({ received: true, duplicate: true });

  const status = statusFor(event.type, session);
  if (status) {
    try {
      await updateDonation(session.id, status, {
        amountCents: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        frequency: session.mode === "subscription" ? "monthly" : "once",
        designation: session.metadata?.designation ?? "general",
      });
    } catch {
      // Not acknowledged: Stripe retries later.
      return json({ ok: false, error: "store_unavailable" }, 500);
    }
  }
  await store.set(seenKey, "1", { ttlSeconds: 60 * 60 * 24 * 30 });
  return json({ received: true });
}
