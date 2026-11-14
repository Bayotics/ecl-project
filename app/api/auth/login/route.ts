import { clearSession, setSession, verifyPassword } from "@/lib/auth/session";
import { collection, requireDatabase } from "@/lib/db/mongo";
import { isValidEmail } from "@/lib/email";
import { ApiError, handle, text } from "@/lib/server/api";

export async function POST(request: Request) {
  return handle(request, { body: 2048, limit: ["login", 10, 600] }, async ({ data }) => {
    const email = text(data.email, 254).toLowerCase();
    const password = typeof data.password === "string" ? data.password : "";
    if (!isValidEmail(email) || !password) throw new ApiError("Enter your email address and password.");
    const user = await collection(await requireDatabase(), "users").findOne({ email });
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      await clearSession();
      throw new ApiError("Invalid email or password.", 401);
    }
    if (!user.email_confirmed_at) throw new ApiError("Please confirm your email address first. Check your inbox for the link.", 403);
    await setSession(user.id);
    return { admin: user.role === "admin" };
  });
}
