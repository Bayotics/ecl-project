import "server-only";

import { deliver, type DeliveryResult, type FormKind } from "./deliver";
import { clientIp, filledHoneypot, isCrossSite, json, readJsonObject } from "./http";
import { rateLimit } from "./rate-limit";

interface FormRouteOptions {
  form: FormKind;
  maxBytes: number;
  /** Submissions per client address per window. */
  limit?: number;
  windowSeconds?: number;
  validate: (data: Record<string, unknown>) => Record<string, string | undefined>;
  /** The cleaned fields forwarded to the form service. */
  fields: (data: Record<string, unknown>) => Record<string, unknown>;
}

const ERROR_STATUS: Record<Exclude<DeliveryResult, { ok: true }>["error"], number> = {
  not_configured: 503,
  upstream_error: 502,
  upstream_unreachable: 502,
};

/**
 * The shared pipeline for the public forms: same-site check → rate limit → size-limited JSON →
 * honeypot → server validation → delivery to the configured service. Success is reported only after
 * the service acknowledges; errors are generic so nothing internal leaks to the browser.
 */
export async function handleForm(request: Request, options: FormRouteOptions): Promise<Response> {
  if (isCrossSite(request)) return json({ ok: false, error: "forbidden" }, 403);

  const limited = await rateLimit(`${options.form}:${clientIp(request)}`, options.limit ?? 5, options.windowSeconds ?? 600);
  if (!limited.ok) {
    return json({ ok: false, error: "rate_limited" }, 429, { "Retry-After": String(limited.retryAfter) });
  }

  const body = await readJsonObject(request, options.maxBytes);
  if (!body.ok) return body.response;

  // Honeypot filled: accept silently so bots get no signal.
  if (filledHoneypot(body.data)) return json({ ok: true });

  const errors = Object.fromEntries(Object.entries(options.validate(body.data)).filter(([, v]) => v));
  if (Object.keys(errors).length) return json({ ok: false, error: "invalid", errors }, 400);

  const result = await deliver(options.form, options.fields(body.data));
  if (!result.ok) return json({ ok: false, error: result.error }, ERROR_STATUS[result.error]);
  return json({ ok: true });
}
