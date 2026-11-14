import { consumeToken, hashPassword, setSession } from "@/lib/auth/session";
import { collection, requireDatabase } from "@/lib/db/mongo";
import { ApiError, handle } from "@/lib/server/api";

export async function POST(request: Request) {
  return handle(request, { body: 2048, limit: ["reset", 10, 3600] }, async ({ data }) => {
    const password = typeof data.password === "string" ? data.password : "";
    if (password.length < 6 || password.length > 128) throw new ApiError("Password must contain at least 6 characters.");
    const userId = await consumeToken(typeof data.token === "string" ? data.token : "", "reset");
    if (!userId) throw new ApiError("This reset link is invalid or has expired. Request a new one.");
    const users = collection(await requireDatabase(), "users");
    const now = new Date().toISOString();
    await users.updateOne({ id: userId }, { $set: { password_hash: await hashPassword(password), updated_at: now } });
    // Following the emailed link also proves the address.
    await users.updateOne({ id: userId, email_confirmed_at: null }, { $set: { email_confirmed_at: now } });
    await setSession(userId);
    return {};
  });
}
