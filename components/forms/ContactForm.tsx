"use client";

import { useId, type FormEvent } from "react";

import { CONTACT_TOPICS, validateContact } from "@/lib/forms";

import { Field, FormStatus, Honeypot } from "./Field";
import styles from "./forms.module.css";
import { useSubmission } from "./useSubmission";

interface ContactFormProps {
  /** Shown when the site cannot deliver messages, so visitors still have a way through. */
  fallback: { email: string; phone: string };
  /** Preselected topic, e.g. "Partnership" from the get-involved page. */
  defaultTopic?: string;
}

/**
 * Contact form (dialog and /contact). Validates on the client and the server; success is reported only
 * after the server confirms the message was handed to the configured inbox/provider.
 */
export function ContactForm({ fallback, defaultTopic }: ContactFormProps) {
  const uid = useId();
  const { status, errors, message, submit } = useSubmission({
    endpoint: "/api/contact",
    validate: validateContact,
    pending: "Sending…",
    success: "Thank you. Your message has been sent to Eko Club Louisiana.",
    unavailable: `Messages can't be sent from the website yet. Please email ${fallback.email} or call ${fallback.phone}.`,
    event: "Contact message",
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    submit(form, Object.fromEntries(new FormData(form)) as Record<string, string>);
  };

  if (status === "success") {
    return (
      <p className={styles.success} role="status">
        {message}
      </p>
    );
  }

  const topic = defaultTopic && (CONTACT_TOPICS as readonly string[]).includes(defaultTopic) ? defaultTopic : "";

  return (
    <form className={styles.form} noValidate onSubmit={onSubmit} aria-busy={status === "submitting"}>
      <Field id={`${uid}-name`} label="Name" error={errors.name}>
        {(props) => <input {...props} name="name" type="text" autoComplete="name" maxLength={100} className={styles.input} />}
      </Field>
      <Field id={`${uid}-email`} label="Email" error={errors.email}>
        {(props) => (
          <input {...props} name="email" type="email" autoComplete="email" inputMode="email" maxLength={254} className={styles.input} />
        )}
      </Field>
      <Field id={`${uid}-topic`} label="Topic" error={errors.topic}>
        {(props) => (
          <select {...props} name="topic" defaultValue={topic} className={styles.input}>
            <option value="" disabled>
              Choose a topic
            </option>
            {CONTACT_TOPICS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field id={`${uid}-message`} label="Message" error={errors.message}>
        {(props) => <textarea {...props} name="message" rows={5} maxLength={5000} className={styles.textarea} />}
      </Field>
      <Honeypot id={`${uid}-company`} />
      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Send message"}
        </button>
        <FormStatus status={status} message={message} />
      </div>
    </form>
  );
}
