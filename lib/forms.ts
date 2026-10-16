// Validation shared by the forms (client) and their API routes (server), so both agree exactly.
import { isValidEmail } from "./email";

export const CONTACT_TOPICS = ["General question", "Membership", "Events", "Partnership", "Media", "Other"] as const;

export type ContactErrors = Partial<Record<"name" | "email" | "topic" | "message", string>>;
export type NewsletterErrors = Partial<Record<"email" | "consent", string>>;

export interface ContactInput {
  name?: unknown;
  email?: unknown;
  topic?: unknown;
  message?: unknown;
}

const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export function validateContact(input: ContactInput): ContactErrors {
  const errors: ContactErrors = {};
  const name = str(input.name);
  const email = str(input.email);
  const topic = str(input.topic);
  const message = str(input.message);
  if (!name) errors.name = "Enter your name.";
  else if (name.length > 100) errors.name = "Use 100 characters or fewer.";
  if (!isValidEmail(email)) errors.email = "Enter a valid email address, like name@example.com.";
  if (!(CONTACT_TOPICS as readonly string[]).includes(topic)) errors.topic = "Choose a topic.";
  if (message.length < 10) errors.message = "Write a message of at least 10 characters.";
  else if (message.length > 5000) errors.message = "Use 5,000 characters or fewer.";
  return errors;
}

export function validateNewsletter(input: { email?: unknown; name?: unknown; consent?: unknown; company?: unknown }): NewsletterErrors {
  const errors: NewsletterErrors = {};
  if (!isValidEmail(str(input.email))) errors.email = "Enter a valid email address, like name@example.com.";
  if (input.consent !== true) errors.consent = "Please confirm you agree to receive email updates.";
  return errors;
}

/* ── Membership, volunteering and RSVP (Prompt 9) ───────────────────── */

export type MembershipErrors = Partial<Record<"name" | "email" | "phone" | "city" | "interests" | "message" | "acknowledge", string>>;
export type VolunteerErrors = Partial<Record<"name" | "email" | "phone" | "interests" | "availability" | "message" | "consent", string>>;
export type RsvpErrors = Partial<Record<"name" | "email" | "party", string>>;

const PHONE_PATTERN = /^[+()\-.\s\d]{7,20}$/;

function checkPerson(input: { name?: unknown; email?: unknown; phone?: unknown }, errors: Record<string, string>) {
  const name = str(input.name);
  const phone = str(input.phone);
  if (!name) errors.name = "Enter your name.";
  else if (name.length > 100) errors.name = "Use 100 characters or fewer.";
  if (!isValidEmail(str(input.email))) errors.email = "Enter a valid email address, like name@example.com.";
  if (phone && !PHONE_PATTERN.test(phone)) errors.phone = "Enter a phone number using digits, spaces, + or -.";
}

/** Interests must all come from the allowed list (the published program slugs, plus any extras). */
function checkInterests(value: unknown, allowed: readonly string[]): string | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > allowed.length) return "Choose from the listed areas.";
  return value.every((item) => typeof item === "string" && allowed.includes(item)) ? undefined : "Choose from the listed areas.";
}

function checkOptionalText(value: unknown, max: number): string | undefined {
  if (value === undefined || value === "") return undefined;
  if (typeof value !== "string") return "Enter text only.";
  return value.trim().length > max ? `Use ${max.toLocaleString("en-US")} characters or fewer.` : undefined;
}

export interface MembershipInput {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  city?: unknown;
  interests?: unknown;
  message?: unknown;
  acknowledge?: unknown;
}

export function validateMembership(input: MembershipInput, allowedInterests: readonly string[]): MembershipErrors {
  const errors: MembershipErrors = {};
  checkPerson(input, errors);
  const city = checkOptionalText(input.city, 100);
  if (city) errors.city = city;
  const interests = checkInterests(input.interests, allowedInterests);
  if (interests) errors.interests = interests;
  const message = checkOptionalText(input.message, 1000);
  if (message) errors.message = message;
  if (input.acknowledge !== true) errors.acknowledge = "Please confirm you have read this before sending.";
  return errors;
}

export interface VolunteerInput {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  interests?: unknown;
  availability?: unknown;
  message?: unknown;
  consent?: unknown;
}

export function validateVolunteer(input: VolunteerInput, allowedInterests: readonly string[]): VolunteerErrors {
  const errors: VolunteerErrors = {};
  checkPerson(input, errors);
  const interests = checkInterests(input.interests, allowedInterests);
  if (interests) errors.interests = interests;
  const availability = checkOptionalText(input.availability, 200);
  if (availability) errors.availability = availability;
  const message = checkOptionalText(input.message, 1000);
  if (message) errors.message = message;
  if (input.consent !== true) errors.consent = "Please confirm the club may contact you about volunteering.";
  return errors;
}

export function validateRsvp(input: { name?: unknown; email?: unknown; party?: unknown }, maxPartySize: number): RsvpErrors {
  const errors: RsvpErrors = {};
  checkPerson(input, errors);
  const party = Number(input.party);
  if (!Number.isInteger(party) || party < 1 || party > maxPartySize) {
    errors.party = maxPartySize === 1 ? "RSVPs are for one person." : `Choose between 1 and ${maxPartySize} people.`;
  }
  return errors;
}
