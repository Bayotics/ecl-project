"use client";

import { useId, useState, type FormEvent } from "react";

import formStyles from "@/components/forms/forms.module.css";
import { track } from "@/lib/analytics";

import styles from "./donate.module.css";

interface DonateFormProps {
  presets: number[];
  min: number;
  max: number;
  currency: string;
  designations: Array<{ id: string; label: string }>;
  recurring: boolean;
}

type Status = "idle" | "submitting" | "redirecting" | "error";

const usd = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

/** One random id per donation attempt; the server folds it into the provider's idempotency key. */
const newAttempt = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 18)}`;

/**
 * Short donation entry: frequency (only when monthly giving is approved), preset or custom amount, and
 * designation. Payment details are entered on the provider's hosted checkout page, never here.
 */
export function DonateForm({ presets, min, max, currency, designations, recurring }: DonateFormProps) {
  const uid = useId();
  const [attempt] = useState(newAttempt);
  const [choice, setChoice] = useState<string>(String(presets[1] ?? presets[0]));
  const [custom, setCustom] = useState("");
  const [frequency, setFrequency] = useState<"once" | "monthly">("once");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const amount = choice === "other" ? Number(custom) : Number(choice);
  const valid = Number.isInteger(amount) && amount >= min && amount <= max;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!valid) {
      setError(`Enter a whole-dollar amount between ${usd(min)} and ${usd(max)}.`);
      document.getElementById(`${uid}-custom`)?.focus();
      return;
    }
    setError(null);
    setStatus("submitting");
    setMessage("Preparing secure checkout…");
    const designation = String(new FormData(event.currentTarget).get("designation") ?? designations[0]?.id);
    try {
      const response = await fetch("/api/donate/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency, frequency, designation, attempt }),
      });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; url?: string; errors?: Record<string, string> };
      if (response.ok && body.ok && body.url) {
        setStatus("redirecting");
        setMessage("Opening secure checkout…");
        track("Donation checkout", { frequency });
        window.location.assign(body.url);
        return;
      }
      setStatus("error");
      if (response.status === 400 && body.errors) setMessage(Object.values(body.errors)[0] ?? "Please check your gift details.");
      else if (response.status === 429) setMessage("Too many attempts. Please wait a few minutes and try again.");
      else if (response.status === 503) setMessage("Online giving is unavailable right now. Please try again later or contact the club.");
      else setMessage("Checkout could not be started. Nothing has been charged; please try again.");
    } catch {
      setStatus("error");
      setMessage("We couldn't reach the server. Nothing has been charged; check your connection and try again.");
    }
  };

  const busy = status === "submitting" || status === "redirecting";

  return (
    <form className={styles.form} noValidate onSubmit={onSubmit} aria-busy={busy}>
      {recurring ? (
        <fieldset className={styles.fieldset}>
          <legend className={formStyles.label}>Frequency</legend>
          <div className={styles.segmented}>
            {(["once", "monthly"] as const).map((value) => (
              <label key={value} className={styles.choice}>
                <input
                  type="radio"
                  name="frequency"
                  value={value}
                  checked={frequency === value}
                  onChange={() => setFrequency(value)}
                />
                <span>{value === "once" ? "One time" : "Monthly"}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <fieldset className={styles.fieldset} aria-describedby={error ? `${uid}-error` : undefined}>
        <legend className={formStyles.label}>Amount</legend>
        <div className={styles.amounts}>
          {presets.map((value) => (
            <label key={value} className={styles.choice}>
              <input
                type="radio"
                name="amount"
                value={value}
                checked={choice === String(value)}
                onChange={() => setChoice(String(value))}
              />
              <span>{usd(value)}</span>
            </label>
          ))}
          <label className={styles.choice}>
            <input type="radio" name="amount" value="other" checked={choice === "other"} onChange={() => setChoice("other")} />
            <span>Other</span>
          </label>
        </div>
        {choice === "other" ? (
          <div className={styles.custom}>
            <label htmlFor={`${uid}-custom`} className={formStyles.label}>
              Amount in US dollars
            </label>
            <div className={styles.customInput}>
              <span aria-hidden="true">$</span>
              <input
                id={`${uid}-custom`}
                name="custom"
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                step={1}
                value={custom}
                onChange={(event) => setCustom(event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={`${uid}-range${error ? ` ${uid}-error` : ""}`}
                className={formStyles.input}
              />
            </div>
            <p id={`${uid}-range`} className={styles.hint}>
              {usd(min)} to {usd(max)}, whole dollars
            </p>
          </div>
        ) : null}
        {error ? (
          <p id={`${uid}-error`} className={formStyles.error}>
            {error}
          </p>
        ) : null}
      </fieldset>

      {designations.length > 1 ? (
        <div className={formStyles.field}>
          <label htmlFor={`${uid}-designation`} className={formStyles.label}>
            Direct my gift to
          </label>
          <select id={`${uid}-designation`} name="designation" className={formStyles.input} defaultValue={designations[0].id}>
            {designations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <input type="hidden" name="designation" value={designations[0]?.id} />
      )}

      <div className={formStyles.actions}>
        <button type="submit" className={formStyles.submit} disabled={busy}>
          {busy ? "Please wait…" : valid ? `Continue to secure checkout · ${usd(amount)}${frequency === "monthly" ? " / month" : ""}` : "Continue to secure checkout"}
        </button>
        <p className={formStyles.status} data-kind={status === "error" ? "error" : status} role="status" aria-live="polite">
          {status === "idle" ? "" : message}
        </p>
        <p className={styles.hint}>
          You will complete your gift on Stripe&apos;s secure checkout page. Eko Club Louisiana never sees or stores your card
          details.
        </p>
      </div>
    </form>
  );
}
