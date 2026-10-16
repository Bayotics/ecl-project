"use client";

import { useId, type FormEvent } from "react";

import { validateNewsletter } from "@/lib/forms";

import { Check, Field, FormStatus, Honeypot } from "./Field";
import styles from "./forms.module.css";
import { useSubmission } from "./useSubmission";

/**
 * Newsletter signup (dialog and /contact): email, optional name, explicit consent. Success is shown only
 * after the server confirms the signup service accepted it.
 */
export function NewsletterSignup() {
  const uid = useId();
  const { status, errors, message, submit } = useSubmission({
    endpoint: "/api/newsletter",
    validate: validateNewsletter,
    pending: "Signing you up…",
    success: "Thank you. You're signed up for updates from Eko Club Louisiana.",
    unavailable: "Newsletter signup isn't available yet. Please check back soon, or follow the club's news on this site.",
    event: "Newsletter signup",
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = new FormData(form);
    submit(form, {
      email: String(raw.get("email") ?? ""),
      name: String(raw.get("name") ?? ""),
      consent: raw.get("consent") === "yes",
      company: String(raw.get("company") ?? ""),
    });
  };

  if (status === "success") {
    return (
      <p className={styles.success} role="status">
        {message}
      </p>
    );
  }

  return (
    <form className={styles.form} noValidate onSubmit={onSubmit} aria-busy={status === "submitting"}>
      <Field id={`${uid}-email`} label="Email" error={errors.email}>
        {(props) => (
          <input {...props} name="email" type="email" autoComplete="email" inputMode="email" maxLength={254} className={styles.input} />
        )}
      </Field>
      <Field id={`${uid}-name`} label="Name" optional>
        {(props) => <input {...props} name="name" type="text" autoComplete="name" maxLength={100} className={styles.input} />}
      </Field>
      <Check
        id={`${uid}-consent`}
        name="consent"
        label="I agree to receive email updates from Eko Club Louisiana and understand I can unsubscribe at any time."
        error={errors.consent}
      />
      <Honeypot id={`${uid}-company`} />
      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={status === "submitting"}>
          {status === "submitting" ? "Signing up…" : "Sign up"}
        </button>
        <FormStatus status={status} message={message} />
      </div>
    </form>
  );
}
