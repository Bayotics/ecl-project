import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stripe adapter for hosted Checkout. Card details are entered only on Stripe's own page; this site
 * never sees or stores them. Keys stay on the server.
 *
 * Required: STRIPE_SECRET_KEY (sk_test_… in sandbox) and STRIPE_WEBHOOK_SECRET (whsec_…).
 * Live keys (sk_live_…) are refused unless DONATIONS_ALLOW_LIVE=true, so a test deployment can never
 * take a real payment by accident. STRIPE_API_BASE (test keys only) points the adapter at a local mock.
 */

export interface StripeConfig {
  secretKey: string;
  webhookSecret: string;
  mode: "test" | "live";
  apiBase: string;
}

export function stripeConfig(): { config: StripeConfig | null; missing: string[]; refused: string | null } {
  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";
  const missing = [!secretKey && "STRIPE_SECRET_KEY", !webhookSecret && "STRIPE_WEBHOOK_SECRET"].filter(Boolean) as string[];
  if (missing.length) return { config: null, missing, refused: null };

  const mode = secretKey.startsWith("sk_live_") || secretKey.startsWith("rk_live_") ? "live" : "test";
  if (mode === "live" && process.env.DONATIONS_ALLOW_LIVE !== "true") {
    return { config: null, missing: [], refused: "Live Stripe key present but DONATIONS_ALLOW_LIVE is not \"true\"." };
  }
  const apiBase = mode === "test" && process.env.STRIPE_API_BASE ? process.env.STRIPE_API_BASE : "https://api.stripe.com";
  return { config: { secretKey, webhookSecret, mode, apiBase }, missing: [], refused: null };
}

export interface CheckoutRequest {
  amountCents: number;
  currency: string;
  frequency: "once" | "monthly";
  designation: { id: string; label: string };
  idempotencyKey: string;
  successUrl: string;
  cancelUrl: string;
  productName: string;
}

export type CheckoutResult = { ok: true; id: string; url: string } | { ok: false; error: string };

/** Creates a hosted Checkout Session (payment, or subscription for monthly gifts). */
export async function createCheckoutSession(config: StripeConfig, request: CheckoutRequest): Promise<CheckoutResult> {
  const form = new URLSearchParams();
  const monthly = request.frequency === "monthly";
  form.set("mode", monthly ? "subscription" : "payment");
  form.set("success_url", request.successUrl);
  form.set("cancel_url", request.cancelUrl);
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", request.currency);
  form.set("line_items[0][price_data][unit_amount]", String(request.amountCents));
  form.set("line_items[0][price_data][product_data][name]", request.productName);
  if (monthly) form.set("line_items[0][price_data][recurring][interval]", "month");
  else form.set("submit_type", "donate");
  form.set("metadata[designation]", request.designation.id);
  form.set("metadata[frequency]", request.frequency);
  form.set("metadata[source]", "website");

  try {
    const response = await fetch(`${config.apiBase}/v1/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        // Retries of the same attempt return the same session instead of creating a second one.
        "Idempotency-Key": request.idempotencyKey,
      },
      body: form,
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    const body = (await response.json().catch(() => ({}))) as { id?: string; url?: string; error?: { message?: string } };
    if (!response.ok || !body.id || !body.url) return { ok: false, error: body.error?.message ?? `provider_${response.status}` };
    return { ok: true, id: body.id, url: body.url };
  } catch {
    return { ok: false, error: "provider_unreachable" };
  }
}

/**
 * Verifies a `Stripe-Signature` header (`t=…,v1=…`) over the raw body with the endpoint secret,
 * rejecting stale timestamps to block replays.
 */
export function verifyStripeSignature(payload: string, header: string | null, secret: string, toleranceSeconds = 300, now = Date.now()): boolean {
  if (!header) return false;
  const parts = header.split(",").map((part) => part.split("=") as [string, string]);
  const timestamp = Number(parts.find(([k]) => k === "t")?.[1]);
  const signatures = parts.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!Number.isFinite(timestamp) || !signatures.length) return false;
  if (Math.abs(now / 1000 - timestamp) > toleranceSeconds) return false;

  const expected = Buffer.from(createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex"), "utf8");
  return signatures.some((signature) => {
    const given = Buffer.from(signature, "utf8");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}
