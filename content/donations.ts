import { DRAFT, draftReview, meta } from "./meta";

/**
 * Donation settings (club staff can edit these without touching code elsewhere). The server validates
 * every checkout request against this file, so an amount, currency or designation that is not listed
 * here can never reach the payment provider.
 */
export const donationSettings = {
  /** ISO 4217, lower case, as the payment provider expects. */
  currency: "usd",
  /** One-time preset amounts in whole dollars. */
  presets: [25, 50, 100, 250],
  /** Custom amount bounds in whole dollars. */
  min: 5,
  max: 10000,
  /** Where a gift may be directed. Only published designations are offered. */
  designations: [{ id: "general", label: "Where it is needed most", status: "published" as const }],
  /**
   * Monthly giving appears only when the club approves it here AND the configured provider supports
   * subscriptions (Stripe Checkout does).
   */
  recurring: { approved: false, interval: "month" as const },
  ...meta(
    DRAFT,
    draftReview(
      "Confirm the preset amounts, the minimum and maximum, and whether gifts can be directed to specific areas.",
      "Confirm whether monthly giving should be offered.",
      "Do not state tax-deductibility until the club confirms its tax status.",
    ),
  ),
};

export type DonationFrequency = "once" | "monthly";

export const publishedDesignations = () => donationSettings.designations.filter((d) => d.status === "published");
