import { randomUUID } from "node:crypto";

import { hashPassword, issueToken, setSession } from "@/lib/auth/session";
import { isEmailConfigured, sendEmail } from "@/lib/auth/mailer";
import { collection, requireDatabase } from "@/lib/db/mongo";
import { isValidEmail } from "@/lib/email";
import { ApiError, handle, text } from "@/lib/server/api";
import { siteOrigin } from "@/lib/server/http";

/**
 * Creates a member account. With email configured the address must be confirmed before signing in
 * (as before); without it the account is confirmed and signed in straight away.
 */
export async function POST(request: Request) {
  return handle(request, { body: 2048, limit: ["signup", 5, 3600] }, async ({ data }) => {
    const name = text(data.name, 120);
    const email = text(data.email, 254).toLowerCase();
    const password = typeof data.password === "string" ? data.password : "";
    if (!name) throw new ApiError("Enter your full name.");
    if (!isValidEmail(email)) throw new ApiError("Enter a valid email address.");
    if (password.length < 6 || password.length > 128) throw new ApiError("Password must contain at least 6 characters.");

    const db = await requireDatabase();
    const users = collection(db, "users");
    if (await users.findOne({ email })) throw new ApiError("An account already exists for that email. Sign in or reset your password.", 409);

    const id = randomUUID();
    const now = new Date().toISOString();
    const confirmByEmail = isEmailConfigured();
    await users.insertOne({ _id: id, id, email, password_hash: await hashPassword(password), role: "member", email_confirmed_at: confirmByEmail ? null : now, created_at: now, updated_at: now });
    await collection(db, "profiles").insertOne({ _id: id, id, full_name: name, phone: "", created_at: now, updated_at: now });

    if (!confirmByEmail) {
      await setSession(id);
      return { signedIn: true };
    }
    const token = await issueToken(id, "confirm", 48);
    await sendEmail(
      email,
      "Confirm your Eko Club Louisiana account",
      `Hello ${name},\n\nConfirm your email address to finish creating your account:\n${siteOrigin(request)}/api/auth/confirm?token=${token}\n\nThe link expires in 48 hours. If you did not sign up, ignore this email.\n\nEko Club Louisiana`,
    );
    return { signedIn: false };
  });
}
