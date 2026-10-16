import type { ReactNode } from "react";

import styles from "./forms.module.css";

interface FieldProps {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: (props: { id: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ReactNode;
}

/** Visible label, the control, and an error message wired to it. */
export function Field({ id, label, error, optional, children }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className={styles.field} data-invalid={error ? "true" : undefined}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional ? <span className={styles.optional}> (optional)</span> : null}
      </label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": error ? errorId : undefined })}
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Off-screen field that people never see but simple bots fill in. */
export function Honeypot({ id }: { id: string }) {
  return (
    <div className={styles.trap} aria-hidden="true">
      <label htmlFor={id}>Company</label>
      <input id={id} name="company" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

interface CheckProps {
  id: string;
  name: string;
  label: string;
  error?: string;
}

/** A single required checkbox (consent or acknowledgement) with its own error message. */
export function Check({ id, name, label, error }: CheckProps) {
  return (
    <div className={styles.consent} data-invalid={error ? "true" : undefined}>
      <input
        id={id}
        name={name}
        type="checkbox"
        value="yes"
        className={styles.checkbox}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <label htmlFor={id}>{label}</label>
      {error ? (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface CheckboxGroupProps {
  id: string;
  name: string;
  legend: string;
  options: Array<{ id: string; label: string }>;
  defaultValues?: string[];
  error?: string;
  optional?: boolean;
}

/** A set of checkboxes in a fieldset, e.g. areas of interest. */
export function CheckboxGroup({ id, name, legend, options, defaultValues = [], error, optional }: CheckboxGroupProps) {
  return (
    <fieldset
      className={styles.group}
      data-invalid={error ? "true" : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend className={styles.label}>
        {legend}
        {optional ? <span className={styles.optional}> (optional)</span> : null}
      </legend>
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.id} className={styles.option}>
            <input
              type="checkbox"
              name={name}
              value={option.id}
              defaultChecked={defaultValues.includes(option.id)}
              className={styles.checkbox}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Status line under the submit button; announced politely. */
export function FormStatus({ status, message }: { status: string; message: string }) {
  return (
    <p className={styles.status} data-kind={status} role="status" aria-live="polite">
      {status === "idle" ? "" : message}
    </p>
  );
}
