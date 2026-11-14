import "server-only";

import { sections } from "@/lib/db/admin-fields";
import type { TableName } from "@/lib/db/types";
import { ApiError } from "./api";

type Value = string | number | boolean | null;

export function adminSection(table: string) {
  if (!Object.hasOwn(sections, table)) throw new ApiError("Unknown section.", 404);
  return { name: table as TableName, config: sections[table] };
}

/**
 * Builds a document from an admin form: only the section's editable fields, each coerced to its type
 * and validated, so the browser can never write fields or values the dashboard does not offer.
 */
export function recordFromForm(table: string, data: Record<string, unknown>) {
  const { config } = adminSection(table);
  const record: Record<string, Value> = {};
  for (const field of config.fields) {
    if (field.readOnly) continue;
    const raw = data[field.key];
    let value: Value;
    if (field.type === "checkbox") value = raw === true;
    else if (field.type === "number") {
      value = raw === "" || raw == null ? null : Number(raw);
      if (value !== null && (!Number.isInteger(value) || (field.key === "capacity" && value < 1))) throw new ApiError(`Enter a valid ${field.label.toLowerCase()}.`);
      if (value === null && field.key === "sort_order") value = 0;
    } else {
      value = typeof raw === "string" ? raw.trim().slice(0, field.type === "textarea" ? 20000 : 2000) : "";
      if (field.type === "datetime-local" && value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) throw new ApiError(`Enter a valid ${field.label.toLowerCase()}.`);
        value = date.toISOString();
      }
      if (field.type === "date" && !value) value = null;
      if (field.options && value && !field.options.includes(value)) throw new ApiError(`Choose a valid ${field.label.toLowerCase()}.`);
    }
    if (field.required && (value === null || value === "")) throw new ApiError(`${field.label} is required.`);
    if (field.key === "slug" && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(value))) throw new ApiError("Use lowercase letters, numbers and dashes for the slug.");
    if ((field.key.endsWith("_url") || field.type === "image" || field.type === "media") && value && !/^(https:\/\/|\/[^/])/.test(String(value))) throw new ApiError("Use a site path or HTTPS URL.");
    if (field.type === "email" && value && !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(String(value))) throw new ApiError("Enter a valid email address.");
    record[field.key] = value;
  }
  if (table === "events" && new Date(String(record.end_at)) < new Date(String(record.start_at))) throw new ApiError("The end must be after the start.");
  if (table === "event_media") record.media_type = data.media_type === "video" ? "video" : "image";
  if (table === "newsletter_subscribers" && typeof record.email === "string") record.email = record.email.toLowerCase();
  return record;
}
