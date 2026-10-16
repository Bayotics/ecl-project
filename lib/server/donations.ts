import "server-only";

import { donationSettings, publishedDesignations, type DonationFrequency } from "@/content/donations";

import { getStore } from "./store";
import { stripeConfig } from "./stripe";

/**
 * Donation status as the site knows it. Only a verified provider webhook may move a donation to
 * "paid" (or "failed"); a browser returning from checkout proves nothing.
 */
export type DonationStatus = "pending" | "processing" | "paid" | "failed" | "expired";

export interface DonationRecord {
  status: DonationStatus;
  amountCents: number;
  currency: string;
  frequency: DonationFrequency;
  designation: string;
  created: string;
  updated: string;
}

const KEY = (sessionId: string) => `donation:${sessionId}`;
const TTL = 60 * 60 * 24 * 90;

export const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{8,200}$/;

/** What the donate page needs to know, without exposing configuration details publicly. */
export function donationAvailability(): { available: boolean; recurring: boolean; missing: string[] } {
  const stripe = stripeConfig();
  const missing = [...stripe.missing, ...(getStore() ? [] : ["KV_REST_API_URL/KV_REST_API_TOKEN or DATA_DIR"])];
  if (stripe.refused) missing.push(stripe.refused);
  const available = !!stripe.config && !!getStore();
  // Stripe Checkout supports subscriptions; offer them only when the club has approved monthly giving.
  return { available, recurring: available && donationSettings.recurring.approved, missing };
}

export type DonationInputError = "amount" | "currency" | "frequency" | "designation";

/** Server-side check of a checkout request against content/donations.ts. */
export function validateDonation(input: Record<string, unknown>, recurringAllowed: boolean) {
  const errors: Partial<Record<DonationInputError, string>> = {};
  const amount = Number(input.amount);
  const { min, max } = donationSettings;
  if (!Number.isInteger(amount) || amount < min || amount > max) {
    errors.amount = `Enter a whole-dollar amount between $${min} and $${max.toLocaleString("en-US")}.`;
  }
  if (input.currency !== donationSettings.currency) errors.currency = "Unsupported currency.";
  const frequency: DonationFrequency | null = input.frequency === "monthly" ? "monthly" : input.frequency === "once" ? "once" : null;
  if (!frequency || (frequency === "monthly" && !recurringAllowed)) errors.frequency = "Choose a one-time gift.";
  const designation = publishedDesignations().find((d) => d.id === input.designation);
  if (!designation) errors.designation = "Choose where your gift should go.";
  return { errors, amount, frequency: frequency ?? ("once" as DonationFrequency), designation };
}

export async function recordDonation(sessionId: string, record: Omit<DonationRecord, "created" | "updated">) {
  const store = getStore();
  if (!store) throw new Error("No data store configured");
  const now = new Date().toISOString();
  await store.set(KEY(sessionId), JSON.stringify({ ...record, created: now, updated: now }), { ttlSeconds: TTL });
}

export async function getDonation(sessionId: string): Promise<DonationRecord | null> {
  const raw = await getStore()?.get(KEY(sessionId));
  return raw ? (JSON.parse(raw) as DonationRecord) : null;
}

/** Order of certainty: once paid or failed, a late "processing" or "expired" event cannot undo it. */
const FINAL: DonationStatus[] = ["paid", "failed"];

export async function updateDonation(sessionId: string, status: DonationStatus, fallback?: Partial<DonationRecord>) {
  const store = getStore();
  if (!store) throw new Error("No data store configured");
  const existing = await getDonation(sessionId);
  if (existing && FINAL.includes(existing.status) && !FINAL.includes(status)) return;
  const now = new Date().toISOString();
  const next: DonationRecord = {
    amountCents: 0,
    currency: donationSettings.currency,
    frequency: "once",
    designation: "general",
    created: now,
    ...fallback,
    ...existing,
    status,
    updated: now,
  };
  await store.set(KEY(sessionId), JSON.stringify(next), { ttlSeconds: TTL });
}
