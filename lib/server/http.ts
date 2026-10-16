import "server-only";

// Small request/response helpers shared by the API routes.

export const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

/** Reads a JSON object body, enforcing a byte limit on the actual payload (not just the header). */
export async function readJsonObject(
  request: Request,
  maxBytes: number,
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; response: Response }> {
  if (Number(request.headers.get("content-length") ?? 0) > maxBytes) {
    return { ok: false, response: json({ ok: false, error: "payload_too_large" }, 413) };
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) {
    return { ok: false, response: json({ ok: false, error: "payload_too_large" }, 413) };
  }
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("not an object");
    return { ok: true, data };
  } catch {
    return { ok: false, response: json({ ok: false, error: "invalid_json" }, 400) };
  }
}

/**
 * Browsers send Origin on cross-site POSTs; reject those so other sites cannot submit forms on a
 * visitor's behalf. Requests without Origin (server-to-server, curl) are allowed through to validation.
 */
export function isCrossSite(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host !== host;
  } catch {
    return true;
  }
}

/** Best-effort client address for rate limiting (first hop of X-Forwarded-For on a proxy/CDN). */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

/** The off-screen "company" field: people never fill it in; simple bots do. */
export const filledHoneypot = (data: Record<string, unknown>) =>
  typeof data.company === "string" && data.company.length > 0;

export const clean = (value: unknown, max = 5000) => (typeof value === "string" ? value.trim().slice(0, max) : "");

/** The site's own origin for absolute return URLs; configured, else derived from the request. */
export function siteOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return new URL(configured).origin;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "localhost:3000";
  const proto = request.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
