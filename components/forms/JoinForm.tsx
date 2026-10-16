"use client";

import { useId, type FormEvent } from "react";

import { validateMembership } from "@/lib/forms";

import { Check, CheckboxGroup, Field, FormStatus, Honeypot } from "./Field";
import styles from "./forms.module.css";
import { checkedValues, useSubmission } from "./useSubmission";

interface JoinFormProps {
  interests: Array<{ id: string; label: string }>;
  acknowledge: string;
  fallback: { email: string; phone: string };
}

/** Membership request. Acknowledged only after the club's form service accepts it; never "approved". */
export function JoinForm({ interests, acknowledge, fallback }: JoinFormProps) {
  const uid = useId();
  const allowed = interests.map((item) => item.id);
  const { status, errors, message, submit } = useSubmission({
    endpoint: "/api/membership",
    validate: (data) => validateMembership(data, allowed),
    pending: "Sending your request…",
    success:
      "Thank you. Your request to join has been received. A member of the club will contact you about the next steps; this is not yet confirmation of membership.",
    unavailable: `Membership requests can't be sent from the website yet. Please email ${fallback.email} or call ${fallback.phone}, and the club will help you.`,
    event: "Membership request",
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = new FormData(form);
    submit(form, {
      name: String(raw.get("name") ?? ""),
      email: String(raw.get("email") ?? ""),
      phone: String(raw.get("phone") ?? ""),
      city: String(raw.get("city") ?? ""),
      interests: checkedValues(form, "interests"),
      message: String(raw.get("message") ?? ""),
      acknowledge: raw.get("acknowledge") === "yes",
      company: String(raw.get("company") ?? ""),
    });
  };

  if (status === "success") {
    return (
      <div className={styles.confirmation} role="status">
        <h3>Request received</h3>
        <p>{message}</p>
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
      <div className={styles.row}>
        <Field id={`${uid}-phone`} label="Phone" optional error={errors.phone}>
          {(props) => <input {...props} name="phone" type="tel" autoComplete="tel" maxLength={20} className={styles.input} />}
        </Field>
        <Field id={`${uid}-city`} label="City" optional error={errors.city}>
          {(props) => (
            <input {...props} name="city" type="text" autoComplete="address-level2" maxLength={100} className={styles.input} />
          )}
        </Field>
      </div>
      <CheckboxGroup id={`${uid}-interests`} name="interests" legend="Areas that interest you" options={interests} error={errors.interests} optional />
      <Field id={`${uid}-message`} label="Anything you would like the club to know" optional error={errors.message}>
        {(props) => <textarea {...props} name="message" rows={4} maxLength={1000} className={styles.textarea} />}
      </Field>
      <Check id={`${uid}-acknowledge`} name="acknowledge" label={acknowledge} error={errors.acknowledge} />
      <Honeypot id={`${uid}-company`} />
      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Send request"}
        </button>
        <FormStatus status={status} message={message} />
      </div>
    </form>
  );
}
