"use client";

import { useId, type FormEvent } from "react";

import { validateRsvp } from "@/lib/forms";

import { Field, FormStatus, Honeypot } from "./Field";
import styles from "./forms.module.css";
import { useSubmission } from "./useSubmission";

interface RsvpFormProps {
  event: { slug: string; title: string; when: string };
  maxPartySize: number;
  fallback: { email: string; phone: string };
}

/** RSVP for one event. The confirmation (with its reference) appears only after the service accepts it. */
export function RsvpForm({ event, maxPartySize, fallback }: RsvpFormProps) {
  const uid = useId();
  const { status, errors, message, result, submit } = useSubmission({
    endpoint: "/api/rsvp",
    validate: (data) => validateRsvp(data, maxPartySize),
    pending: "Sending your RSVP…",
    success: (body) => `Your RSVP is confirmed for ${Number(body.party) === 1 ? "1 person" : `${body.party} people`}.`,
    unavailable: `Online RSVPs aren't available for this event yet. Please email ${fallback.email} or call ${fallback.phone} to let the club know you're coming.`,
    conflicts: {
      full: "Sorry, this event is now full.",
      duplicate: "An RSVP with this email address has already been received for this event.",
      closed: "RSVPs for this event have closed.",
    },
    event: "RSVP",
  });

  const onSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();
    const form = submitEvent.currentTarget;
    const raw = new FormData(form);
    submit(form, {
      event: event.slug,
      name: String(raw.get("name") ?? ""),
      email: String(raw.get("email") ?? ""),
      party: Number(raw.get("party") ?? 1),
      company: String(raw.get("company") ?? ""),
    });
  };

  if (status === "success") {
    return (
      <div className={styles.confirmation} role="status">
        <h3>You&apos;re on the list</h3>
        <p>
          {message} {event.title}, {event.when}.
        </p>
        {typeof result.confirmation === "string" ? (
          <p>
            Reference <span className={styles.code}>{result.confirmation}</span>. Keep it in case you need to change your reply.
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form className={styles.form} noValidate onSubmit={onSubmit} aria-busy={status === "submitting"}>
      <div className={styles.row}>
        <Field id={`${uid}-name`} label="Name" error={errors.name}>
          {(props) => <input {...props} name="name" type="text" autoComplete="name" maxLength={100} className={styles.input} />}
        </Field>
        <Field id={`${uid}-email`} label="Email" error={errors.email}>
          {(props) => (
            <input {...props} name="email" type="email" autoComplete="email" inputMode="email" maxLength={254} className={styles.input} />
          )}
        </Field>
      </div>
      {maxPartySize > 1 ? (
        <Field id={`${uid}-party`} label="Number attending, including you" error={errors.party}>
          {(props) => (
            <select {...props} name="party" defaultValue="1" className={styles.input}>
              {Array.from({ length: maxPartySize }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          )}
        </Field>
      ) : (
        <input type="hidden" name="party" value="1" />
      )}
      <Honeypot id={`${uid}-company`} />
      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "RSVP"}
        </button>
        <FormStatus status={status} message={message} />
      </div>
    </form>
  );
}
