import { validateContact } from "@/lib/forms";
import { handleForm } from "@/lib/server/form-route";
import { clean } from "@/lib/server/http";

/**
 * Contact form. Forwards the message to CONTACT_WEBHOOK_URL (or FORMS_WEBHOOK_URL); without either it
 * answers 503 so the form never claims success. Submissions are not stored or indexed by the site.
 */
export function POST(request: Request) {
  return handleForm(request, {
    form: "contact",
    maxBytes: 16_384,
    validate: validateContact,
    fields: (data) => ({
      name: clean(data.name, 100),
      email: clean(data.email, 254).toLowerCase(),
      topic: clean(data.topic, 50),
      message: clean(data.message, 5000),
    }),
  });
}
