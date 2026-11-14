import { issueToken } from "@/lib/auth/session";
import { isEmailConfigured, sendEmail } from "@/lib/auth/mailer";
import { collection, requireDatabase } from "@/lib/db/mongo";
import { isValidEmail } from "@/lib/email";
import { ApiError, handle, text } from "@/lib/server/api";
import { siteOrigin } from "@/lib/server/http";

/** Sends a reset link. The answer is the same whether or not an account exists. */
export async function POST(request: Request) {
  return handle(request, { body: 1024, limit: ["forgot", 5, 3600] }, async ({ data }) => {
    const email = text(data.email, 254).toLowerCase();
    if (!isValidEmail(email)) throw new ApiError("Enter a valid email address.");
    if (!isEmailConfigured()) throw new ApiError("Password reset by email isn't available yet. Please contact the club and an administrator will help.", 503);
    const user = await collection(await requireDatabase(), "users").findOne({ email });
    if (user) {
      const token = await issueToken(user.id, "reset", 1);
      await sendEmail(
        email,
        "Reset your Eko Club Louisiana password",
        `Use this link to choose a new password:\n${siteOrigin(request)}/reset-password?token=${token}\n\nThe link expires in one hour. If you did not ask for this, ignore this email; your password is unchanged.\n\nEko Club Louisiana`,
      );
    }
    return {};
  });
}
