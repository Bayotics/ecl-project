import "server-only";

import { publicDatabase } from "@/lib/supabase/server";
import { createHmac } from "node:crypto";

/**
 * Hands a validated submission to the club's configured form service (a webhook: e.g. a form-to-email
 * service, Google Apps Script writing to a sheet, Zapier/Make, or a CRM). The site treats a 2xx answer
 * as the service's acknowledgement that the submission is stored; nothing else counts as success.
 *
 * Each form has its own variable; `FORMS_WEBHOOK_URL` is the fallback for all of them. When
 * `FORMS_WEBHOOK_SECRET` is set, the body is signed (`X-ECL-Signature: sha256=<hex HMAC>`) so the
 * receiver can reject forged requests.
 */
export type FormKind = "contact" | "newsletter" | "membership" | "volunteer" | "rsvp";

const ENV: Record<FormKind, string> = {
  contact: "CONTACT_WEBHOOK_URL",
  newsletter: "NEWSLETTER_WEBHOOK_URL",
  membership: "MEMBERSHIP_WEBHOOK_URL",
  volunteer: "VOLUNTEER_WEBHOOK_URL",
  rsvp: "RSVP_WEBHOOK_URL",
};

export const webhookFor = (form: FormKind) => process.env[ENV[form]] || process.env.FORMS_WEBHOOK_URL || null;

export const isDeliveryConfigured = (form: FormKind) => webhookFor(form) !== null || ((form === "contact" || form === "newsletter") && !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export type DeliveryResult = { ok: true } | { ok: false; error: "not_configured" | "upstream_error" | "upstream_unreachable" };

export async function deliver(form: FormKind, fields: Record<string, unknown>): Promise<DeliveryResult> {
  const db = publicDatabase();
  if (db && (form === "contact" || form === "newsletter")) {
    try {
      const result = form === "contact" ? await db.rpc("submit_contact", { p_name: String(fields.name), p_email: String(fields.email), p_phone: "", p_subject: String(fields.topic || "Website enquiry"), p_message: String(fields.message) })
        : await db.rpc("subscribe_newsletter", { p_email: String(fields.email) });
      return result.error ? { ok: false, error: "upstream_error" } : { ok: true };
    } catch { return { ok: false, error: "upstream_unreachable" }; }
  }
  const url = webhookFor(form);
  if (!url) return { ok: false, error: "not_configured" };

  const body = JSON.stringify({ form, submittedAt: new Date().toISOString(), source: "website", ...fields });
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const secret = process.env.FORMS_WEBHOOK_SECRET;
  if (secret) headers["X-ECL-Signature"] = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;

  try {
    const response = await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(8000), cache: "no-store" });
    return response.ok ? { ok: true } : { ok: false, error: "upstream_error" };
  } catch {
    return { ok: false, error: "upstream_unreachable" };
  }
}
