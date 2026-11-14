import { sections } from "@/lib/db/admin-fields";
import { requireDatabase } from "@/lib/db/mongo";
import { handle } from "@/lib/server/api";

/** Record count per dashboard section. */
export async function GET(request: Request) {
  return handle(request, { auth: "admin" }, async () => {
    const db = await requireDatabase();
    const entries = await Promise.all(Object.keys(sections).map(async (table) => [table, await db.collection(table).estimatedDocumentCount()] as const));
    return { counts: Object.fromEntries(entries) };
  });
}
