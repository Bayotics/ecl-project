import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * A small key-value store for state the site itself must remember: RSVP counts (capacity), duplicate
 * RSVP guards, rate-limit windows, and donation status recorded from verified payment webhooks.
 * Personal details from forms are never written here; they go to the configured form service.
 *
 * Adapters, chosen by environment:
 *  - Upstash Redis REST (`KV_REST_API_URL` + `KV_REST_API_TOKEN`, or the `UPSTASH_REDIS_REST_*` pair):
 *    for serverless hosting such as Vercel.
 *  - JSON file in `DATA_DIR`: for a single long-running Node server (VPS). Not for serverless, where
 *    the filesystem is temporary.
 * With neither, `getStore()` returns null and features that need it say so honestly.
 */
export interface Store {
  kind: "upstash" | "file";
  get(key: string): Promise<string | null>;
  /** Returns false when `nx` is set and the key already exists. */
  set(key: string, value: string, options?: { ttlSeconds?: number; nx?: boolean }): Promise<boolean>;
  /** Atomically adds `by` (may be negative) and returns the new value. */
  incrBy(key: string, by: number, ttlSeconds?: number): Promise<number>;
  del(key: string): Promise<void>;
}

/* ── Upstash Redis REST ─────────────────────────────────────────────── */

function upstashStore(url: string, token: string): Store {
  const command = async (...args: Array<string | number>) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`Store error ${response.status}`);
    const body = (await response.json()) as { result?: unknown; error?: string };
    if (body.error) throw new Error(body.error);
    return body.result;
  };

  return {
    kind: "upstash",
    async get(key) {
      const result = await command("GET", key);
      return typeof result === "string" ? result : null;
    },
    async set(key, value, options = {}) {
      const args: Array<string | number> = ["SET", key, value];
      if (options.nx) args.push("NX");
      if (options.ttlSeconds) args.push("EX", options.ttlSeconds);
      return (await command(...args)) === "OK";
    },
    async incrBy(key, by, ttlSeconds) {
      const value = Number(await command("INCRBY", key, by));
      if (ttlSeconds && value === by) await command("EXPIRE", key, ttlSeconds);
      return value;
    },
    async del(key) {
      await command("DEL", key);
    },
  };
}

/* ── JSON file (single Node process) ────────────────────────────────── */

interface FileEntry {
  value: string;
  expires: number | null;
}

function fileStore(dir: string): Store {
  const file = path.join(dir, "store.json");
  let data: Map<string, FileEntry> | null = null;
  // Serializes every operation so read-modify-write sequences cannot interleave.
  let queue: Promise<unknown> = Promise.resolve();

  const load = async () => {
    if (data) return data;
    try {
      data = new Map(Object.entries(JSON.parse(await readFile(file, "utf8")) as Record<string, FileEntry>));
    } catch {
      data = new Map();
    }
    return data;
  };

  const persist = async (map: Map<string, FileEntry>) => {
    await mkdir(dir, { recursive: true });
    const temp = `${file}.${process.pid}.tmp`;
    await writeFile(temp, JSON.stringify(Object.fromEntries(map)), "utf8");
    await rename(temp, file);
  };

  const live = (map: Map<string, FileEntry>, key: string) => {
    const entry = map.get(key);
    if (entry?.expires && entry.expires <= Date.now()) {
      map.delete(key);
      return undefined;
    }
    return entry;
  };

  const run = <T>(task: (map: Map<string, FileEntry>) => Promise<T>): Promise<T> => {
    const next = queue.then(async () => task(await load()));
    queue = next.catch(() => undefined);
    return next;
  };

  const expiry = (ttlSeconds?: number) => (ttlSeconds ? Date.now() + ttlSeconds * 1000 : null);

  return {
    kind: "file",
    get: (key) => run(async (map) => live(map, key)?.value ?? null),
    set: (key, value, options = {}) =>
      run(async (map) => {
        if (options.nx && live(map, key)) return false;
        map.set(key, { value, expires: expiry(options.ttlSeconds) });
        await persist(map);
        return true;
      }),
    incrBy: (key, by, ttlSeconds) =>
      run(async (map) => {
        const current = live(map, key);
        const value = Number(current?.value ?? 0) + by;
        map.set(key, { value: String(value), expires: current?.expires ?? expiry(ttlSeconds) });
        await persist(map);
        return value;
      }),
    del: (key) =>
      run(async (map) => {
        map.delete(key);
        await persist(map);
      }),
  };
}

/* ── Selection ──────────────────────────────────────────────────────── */

let cached: Store | null | undefined;

export function getStore(): Store | null {
  if (cached !== undefined) return cached;
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) cached = upstashStore(url, token);
  else if (process.env.DATA_DIR) cached = fileStore(path.resolve(process.env.DATA_DIR));
  else cached = null;
  return cached;
}
