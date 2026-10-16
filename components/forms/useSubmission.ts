"use client";

import { useState } from "react";

import { track } from "@/lib/analytics";

export type SubmissionStatus = "idle" | "submitting" | "success" | "error";

type Errors = Partial<Record<string, string>>;

interface SubmissionOptions<D> {
  endpoint: string;
  validate: (data: D) => Errors;
  /** Shown while sending, e.g. "Sending…". */
  pending: string;
  /** Shown after the service acknowledges. */
  success: string | ((result: Record<string, unknown>) => string);
  /** Shown when the service is not configured (503): always offers another way through. */
  unavailable: string;
  /** Messages for 409 answers, keyed by the API's `error` code. */
  conflicts?: Record<string, string>;
  /** Analytics event name for a successful submission. */
  event?: string;
}

/**
 * Shared submit cycle for the site's forms: client validation (the server repeats it), loading state,
 * honest outcomes. On any recoverable error the form is left exactly as the visitor filled it in; it is
 * cleared only after the server confirms the submission was accepted.
 */
export function useSubmission<D extends Record<string, unknown>>(options: SubmissionOptions<D>) {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<Record<string, unknown>>({});

  const fail = (text: string) => {
    setStatus("error");
    setMessage(text);
  };

  const submit = async (form: HTMLFormElement, data: D) => {
    const found = options.validate(data);
    setErrors(found);
    const invalid = Object.keys(found).filter((key) => found[key]);
    if (invalid.length) {
      fail("Please correct the highlighted fields.");
      // The error state has not rendered yet, so focus the first invalid control by name.
      const control = form.elements.namedItem(invalid[0]);
      (control instanceof RadioNodeList ? (control[0] as HTMLElement) : (control as HTMLElement | null))?.focus();
      return;
    }

    setStatus("submitting");
    setMessage(options.pending);
    try {
      const response = await fetch(options.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await response.json().catch(() => ({}))) as Record<string, unknown> & { ok?: boolean; error?: string; errors?: Errors };

      if (response.ok && body.ok) {
        form.reset();
        setResult(body);
        setStatus("success");
        setMessage(typeof options.success === "function" ? options.success(body) : options.success);
        if (options.event) track(options.event);
      } else if (response.status === 400 && body.errors) {
        setErrors(body.errors);
        fail("Please correct the highlighted fields.");
      } else if (response.status === 409 && body.error && options.conflicts?.[body.error]) {
        fail(options.conflicts[body.error]);
      } else if (response.status === 429) {
        fail("Too many attempts from this connection. Please wait a few minutes and try again; your details are still here.");
      } else if (response.status === 503) {
        fail(options.unavailable);
      } else {
        fail("This could not be sent just now. Your details are still here, so please try again in a moment.");
      }
    } catch {
      fail("We couldn't reach the server. Check your connection and try again; your details are still here.");
    }
  };

  return { status, errors, message, result, submit };
}

/** All values of a checkbox group, as an array. */
export const checkedValues = (form: HTMLFormElement, name: string) =>
  new FormData(form).getAll(name).map(String);
