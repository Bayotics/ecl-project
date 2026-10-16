import "server-only";

import { getStore } from "./store";

const memory = new Map<string, { count: number; resets: number }>();

/**
 * Fixed-window limit per key (route + client address). Uses the shared store when configured, so the
 * limit holds across serverless instances; otherwise an in-process window (per instance only).
 * A store outage never blocks a legitimate visitor: the limit fails open.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<{ ok: boolean; retryAfter: number }> {
  const now = Date.now();
  const windowStart = Math.floor(now / (windowSeconds * 1000));
  const retryAfter = Math.ceil(((windowStart + 1) * windowSeconds * 1000 - now) / 1000);
  const store = getStore();

  if (store) {
    try {
      const count = await store.incrBy(`rl:${key}:${windowStart}`, 1, windowSeconds);
      return { ok: count <= limit, retryAfter };
    } catch {
      return { ok: true, retryAfter: 0 };
    }
  }

  const id = `${key}:${windowStart}`;
  const entry = memory.get(id) ?? { count: 0, resets: (windowStart + 1) * windowSeconds * 1000 };
  entry.count += 1;
  memory.set(id, entry);
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (v.resets <= now) memory.delete(k);
  }
  return { ok: entry.count <= limit, retryAfter };
}
