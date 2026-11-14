import { MongoServerError } from "mongodb";

import { requireDatabase } from "@/lib/db/mongo";
import { adminSection, recordFromForm } from "@/lib/server/admin-records";
import { ApiError, handle } from "@/lib/server/api";

type Params = { params: Promise<{ table: string; id: string }> };

// site_settings keeps its single numeric id (1); every other record uses a UUID string.
const recordId = (table: string, id: string) => (table === "site_settings" ? Number(id) : id);

export async function PATCH(request: Request, { params }: Params) {
  return handle(request, { body: 64 * 1024, auth: "admin" }, async ({ data }) => {
    const { table, id } = await params;
    const { name, config } = adminSection(table);
    if (config.fields.every((field) => field.readOnly)) throw new ApiError("This section is read-only.", 405);
    try {
      const result = await (await requireDatabase()).collection(name).updateOne({ id: recordId(name, id) }, { $set: { ...recordFromForm(name, data), updated_at: new Date().toISOString() } });
      if (!result.matchedCount) throw new ApiError("That record no longer exists.", 404);
    } catch (error) {
      if (error instanceof MongoServerError && error.code === 11000) throw new ApiError("A record with that slug or email already exists.", 409);
      throw error;
    }
    return {};
  });
}

export async function DELETE(request: Request, { params }: Params) {
  return handle(request, { auth: "admin" }, async () => {
    const { table, id } = await params;
    const { name, config } = adminSection(table);
    if (!config.remove) throw new ApiError("Records cannot be deleted from this section.", 405);
    const db = await requireDatabase();
    if (name === "event_categories" && (await db.collection("event_media").countDocuments({ category_id: id }))) {
      throw new ApiError("Move or delete this category's photos and videos first.", 409);
    }
    const result = await db.collection(name).deleteOne({ id });
    if (!result.deletedCount) throw new ApiError("That record no longer exists.", 404);
    if (name === "gallery_albums") await db.collection("gallery_photos").deleteMany({ album_id: id });
    if (name === "events") await db.collection("event_rsvps").deleteMany({ event_id: id });
    return {};
  });
}
