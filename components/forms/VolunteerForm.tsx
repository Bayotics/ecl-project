"use client";

import { useId, type FormEvent } from "react";

import { validateVolunteer } from "@/lib/forms";

import { Check, CheckboxGroup, Field, FormStatus, Honeypot } from "./Field";
import styles from "./forms.module.css";
import { checkedValues, useSubmission } from "./useSubmission";

interface VolunteerFormProps {
  interests: Array<{ id: string; label: string }>;
  /** Preselected interest from a program page link, e.g. /volunteer?interest=education. */
  defaultInterest?: string;
  consent: string;
  fallback: { email: string; phone: string };
}

export function VolunteerForm({ interests, defaultInterest, consent, fallback }: VolunteerFormProps) {
  const uid = useId();
  const allowed = interests.map((item) => item.id);
  const { status, errors, message, submit } = useSubmission({
    endpoint: "/api/volunteer",
    validate: (data) => validateVolunteer(data, allowed),
    pending: "Sending…",
    success: "Thank you for offering your time. The club has received your details and will be in touch.",
    unavailable: `Volunteer sign-ups can't be sent from the website yet. Please email ${fallback.email} or call ${fallback.phone}.`,
    event: "Volunteer interest",
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = new FormData(form);
    submit(form, {
      name: String(raw.get("name") ?? ""),
      email: String(raw.get("email") ?? ""),
      phone: String(raw.get("phone") ?? ""),
      interests: checkedValues(form, "interests"),
      availability: String(raw.get("availability") ?? ""),
      message: String(raw.get("message") ?? ""),
      consent: raw.get("consent") === "yes",
      company: String(raw.get("company") ?? ""),
    });
  };

  if (status === "success") {
    return (
      <div className={styles.confirmation} role="status">
        <h3>Thank you</h3>
        <p>{message}</p>
      </div>
    );
  }

  const preset = defaultInterest && allowed.includes(defaultInterest) ? [defaultInterest] : [];

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
      <Field id={`${uid}-phone`} label="Phone" optional error={errors.phone}>
        {(props) => <input {...props} name="phone" type="tel" autoComplete="tel" maxLength={20} className={styles.input} />}
      </Field>
      <CheckboxGroup
        id={`${uid}-interests`}
        name="interests"
        legend="Where you would like to help"
        options={interests}
        defaultValues={preset}
        error={errors.interests}
        optional
      />
      <Field id={`${uid}-availability`} label="When you are usually available" optional error={errors.availability}>
        {(props) => (
          <input {...props} name="availability" type="text" maxLength={200} placeholder="e.g. weekends, some evenings" className={styles.input} />
        )}
      </Field>
      <Field id={`${uid}-message`} label="Skills or anything else to share" optional error={errors.message}>
        {(props) => <textarea {...props} name="message" rows={4} maxLength={1000} className={styles.textarea} />}
      </Field>
      <Check id={`${uid}-consent`} name="consent" label={consent} error={errors.consent} />
      <Honeypot id={`${uid}-company`} />
      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Offer to volunteer"}
        </button>
        <FormStatus status={status} message={message} />
      </div>
    </form>
  );
}
