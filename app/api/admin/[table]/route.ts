import { randomUUID } from "node:crypto";
import { MongoServerError } from "mongodb";

import { requireDatabase, rows } from "@/lib/db/mongo";
import { adminSection, recordFromForm } from "@/lib/server/admin-records";
import { ApiError, handle } from "@/lib/server/api";

type Params = { params: Promise<{ table: string }> };

/** All records in a section (drafts included), plus the lookups its form needs. */
export async function GET(request: Request, { params }: Params) {
  return handle(request, { auth: "admin" }, async () => {
    const { name } = adminSection((await params).table);
    const db = await requireDatabase();
    const records = await rows(db, name, {}, name === "site_settings" ? { id: 1 } : { created_at: -1 });
    const categories = name === "event_media" || name === "events" ? await db.collection("event_categories").find({}, { projection: { _id: 0, id: 1, title: 1 } }).sort({ sort_order: 1 }).toArray() : [];
    const albums = name === "gallery_photos" ? await db.collection("gallery_albums").find({}, { projection: { _id: 0, id: 1, title: 1 } }).sort({ title: 1 }).toArray() : [];
    return { rows: records, categories, albums };
  });
}

export async function POST(request: Request, { params }: Params) {
  return handle(request, { body: 64 * 1024, auth: "admin" }, async ({ data }) => {
    const { name, config } = adminSection((await params).table);
    if (!config.create) throw new ApiError("Records cannot be added to this section.", 405);
    const id = randomUUID();
    const now = new Date().toISOString();
    try {
      await (await requireDatabase()).collection(name).insertOne({ _id: id as never, id, ...recordFromForm(name, data), created_at: now, updated_at: now });
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) throw new ApiError("A record with that slug or email already exists.", 409);
      throw error;
    }
    return { id };
  });
}
