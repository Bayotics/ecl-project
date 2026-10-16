import { programInterests } from "@/content/involvement";
import { validateMembership } from "@/lib/forms";
import { handleForm } from "@/lib/server/form-route";
import { clean } from "@/lib/server/http";

/**
 * Membership request (/join). Forwarded to MEMBERSHIP_WEBHOOK_URL (or FORMS_WEBHOOK_URL) for the club
 * to review. A request is never treated as membership approval, and it is not stored or indexed here.
 */
export function POST(request: Request) {
  const allowed = programInterests().map((item) => item.id);
  return handleForm(request, {
    form: "membership",
    maxBytes: 8192,
    validate: (data) => validateMembership(data, allowed),
    fields: (data) => ({
      name: clean(data.name, 100),
      email: clean(data.email, 254).toLowerCase(),
      phone: clean(data.phone, 20) || undefined,
      city: clean(data.city, 100) || undefined,
      interests: Array.isArray(data.interests) ? data.interests : [],
      message: clean(data.message, 1000) || undefined,
      acknowledged: true,
      status: "requested",
    }),
  });
}
