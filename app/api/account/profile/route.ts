import { collection, requireDatabase } from "@/lib/db/mongo";
import { handle, text } from "@/lib/server/api";

export async function PATCH(request: Request) {
  return handle(request, { body: 2048, auth: "member" }, async ({ data, user }) => {
    const now = new Date().toISOString();
    await collection(await requireDatabase(), "profiles").updateOne(
      { id: user!.id },
      { $set: { full_name: text(data.full_name, 120), phone: text(data.phone, 40), updated_at: now }, $setOnInsert: { _id: user!.id, id: user!.id, created_at: now } },
      { upsert: true },
    );
    return {};
  });
}
