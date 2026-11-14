import "server-only";

import { currentUser, type SessionUser } from "@/lib/auth/session";
import { database } from "@/lib/db/mongo";
import { clientIp, isCrossSite, json, readJsonObject } from "./http";
import { rateLimit } from "./rate-limit";

/** A failure the client may show as-is. */
export class ApiError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

type Guard = { body?: number; limit?: [name: string, max: number, windowSeconds: number]; auth?: "member" | "admin" };
type Context = { data: Record<string, unknown>; user: SessionUser | null };

/**
 * Wraps an account/admin API handler: same-site check, optional rate limit, optional JSON body,
 * optional sign-in or administrator requirement, and uniform `{ ok, error }` failures.
 */
export async function handle(request: Request, guard: Guard, run: (context: Context) => Promise<unknown>) {
  try {
    if (request.method !== "GET" && isCrossSite(request)) throw new ApiError("Request blocked.", 403);
    if (!(await database())) throw new ApiError("The club database is not configured yet.", 503);
    if (guard.limit) {
      const [name, max, windowSeconds] = guard.limit;
      const limited = await rateLimit(`${name}:${clientIp(request)}`, max, windowSeconds);
      if (!limited.ok) throw new ApiError("Too many attempts. Please wait a few minutes and try again.", 429);
    }
    let data: Record<string, unknown> = {};
    if (guard.body) {
      const body = await readJsonObject(request, guard.body);
      if (!body.ok) return body.response;
      data = body.data;
    }
    const user = guard.auth ? await currentUser() : null;
    if (guard.auth && !user) throw new ApiError("Please sign in again.", 401);
    if (guard.auth === "admin" && user?.role !== "admin") throw new ApiError("Administrator access required.", 403);
    const result = await run({ data, user });
    return result instanceof Response ? result : json({ ok: true, ...(result as object | undefined) });
  } catch (error) {
    if (error instanceof ApiError) return json({ ok: false, error: error.message }, error.status);
    console.error(error);
    return json({ ok: false, error: "Something went wrong. Please try again." }, 500);
  }
}

export const text = (value: unknown, max = 500) => (typeof value === "string" ? value.trim().slice(0, max) : "");
