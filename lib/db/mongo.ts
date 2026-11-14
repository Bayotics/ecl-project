import "server-only";

import { MongoClient, type Db, type Document, type Filter, type Sort } from "mongodb";
import { unstable_cache } from "next/cache";

import type { TableName, Tables, User } from "./types";

/**
 * MongoDB connection (MONGODB_URI, optional MONGODB_DB). One client per server process, reused across
 * requests and hot reloads. Without MONGODB_URI the site runs on its bundled content, exactly as it
 * does locally, and the member/admin areas report that the database is not configured.
 *
 * Every document keeps its own string `id` (a UUID, preserved from the previous database) as `_id`
 * too, so references such as `event_id`, `album_id` and `category_id` stay plain strings.
 */
type Collections = Tables & { users: User; auth_tokens: AuthToken };
export type AuthToken = { id: string; user_id: string; purpose: "confirm" | "reset"; token_hash: string; expires_at: Date; created_at: Date };

const globalMongo = globalThis as typeof globalThis & { __eclMongo?: Promise<Db> };

export const isDatabaseConfigured = () => Boolean(process.env.MONGODB_URI);

async function connect(): Promise<Db> {
  const client = new MongoClient(process.env.MONGODB_URI!, { serverSelectionTimeoutMS: 10000, appName: "ecl-website" });
  await client.connect();
  // Indexes are created once by scripts/seed-database.mjs, not on every server start.
  return client.db(process.env.MONGODB_DB || "ecl");
}

/** The database, or null when MONGODB_URI is not set. */
export async function database(): Promise<Db | null> {
  if (!isDatabaseConfigured()) return null;
  globalMongo.__eclMongo ??= connect().catch((error) => {
    globalMongo.__eclMongo = undefined;
    throw error;
  });
  return globalMongo.__eclMongo;
}

export async function requireDatabase(): Promise<Db> {
  const db = await database();
  if (!db) throw new Error("The database is not configured. Add MONGODB_URI.");
  return db;
}

export function collection<K extends keyof Collections>(db: Db, name: K) {
  return db.collection<Collections[K] & { _id: string | number }>(name);
}

/** Documents as plain rows: `_id` removed, dates kept as ISO strings. */
export async function rows<K extends TableName>(db: Db, name: K, filter: Filter<Document> = {}, sort: Sort = { sort_order: 1 }): Promise<Tables[K][]> {
  const docs = await db.collection(name).find(filter, { projection: { _id: 0 } }).sort(sort).toArray();
  return docs as unknown as Tables[K][];
}

/** Tag on every cached public read; admin saves clear it so changes appear immediately. */
export const CONTENT_TAG = "content";

/**
 * Published records for the public website, cached across visitors for an hour (or until an admin
 * save clears CONTENT_TAG), so pages don't wait on the database on every visit.
 */
export function publicRows<K extends TableName>(name: K, filter: Filter<Document> = {}, sort: Sort = { sort_order: 1 }): Promise<Tables[K][]> {
  return unstable_cache(
    async () => rows(await requireDatabase(), name, filter, sort),
    ["public-rows", name, JSON.stringify(filter), JSON.stringify(sort)],
    { revalidate: 3600, tags: [CONTENT_TAG] },
  )();
}
