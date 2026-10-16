import { validateNewsletter } from "@/lib/forms";
import { handleForm } from "@/lib/server/form-route";
import { clean } from "@/lib/server/http";

/**
 * Newsletter signup. Requires explicit consent; forwards `{ email, name, consent }` to
 * NEWSLETTER_WEBHOOK_URL (or FORMS_WEBHOOK_URL). Success means the signup service acknowledged it.
 */
export function POST(request: Request) {
  return handleForm(request, {
    form: "newsletter",
    maxBytes: 2048,
    validate: validateNewsletter,
    fields: (data) => ({
      email: clean(data.email, 254).toLowerCase(),
      name: clean(data.name, 100) || undefined,
      consent: true,
    }),
  });
}
