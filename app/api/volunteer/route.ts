import { volunteerInterests } from "@/content/involvement";
import { validateVolunteer } from "@/lib/forms";
import { handleForm } from "@/lib/server/form-route";
import { clean } from "@/lib/server/http";

/** Volunteer interest (/volunteer). Forwarded to VOLUNTEER_WEBHOOK_URL (or FORMS_WEBHOOK_URL). */
export function POST(request: Request) {
  const allowed = volunteerInterests().map((item) => item.id);
  return handleForm(request, {
    form: "volunteer",
    maxBytes: 8192,
    validate: (data) => validateVolunteer(data, allowed),
    fields: (data) => ({
      name: clean(data.name, 100),
      email: clean(data.email, 254).toLowerCase(),
      phone: clean(data.phone, 20) || undefined,
      interests: Array.isArray(data.interests) ? data.interests : [],
      availability: clean(data.availability, 200) || undefined,
      message: clean(data.message, 1000) || undefined,
      consent: true,
    }),
  });
}
