"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { track } from "@/lib/analytics";

import styles from "./donate.module.css";

type View =
  | { kind: "checking" }
  | { kind: "paid" | "processing" | "failed" | "expired" | "pending"; amountCents: number; currency: string; frequency: string }
  | { kind: "unknown" | "unavailable" | "waiting" };

const POLL_MS = 2000;
const MAX_POLLS = 15;

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);

/**
 * Thank-you page status. Reads only what the site recorded from verified payment webhooks, polling for
 * a short while because the webhook usually arrives a moment after the visitor returns.
 */
export function DonationStatus({ sessionId, contact }: { sessionId: string | null; contact: { email: string } }) {
  const [view, setView] = useState<View>(sessionId ? { kind: "checking" } : { kind: "unknown" });
  // Bumped by "Check again" to restart the polling cycle.
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!sessionId) return;
    let polls = 0;
    let timer: number | undefined;
    let cancelled = false;

    const check = async () => {
      try {
        const response = await fetch(`/api/donate/status?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
        const body = (await response.json().catch(() => ({}))) as {
          ok?: boolean;
          status?: "pending" | "processing" | "paid" | "failed" | "expired";
          amountCents?: number;
          currency?: string;
          frequency?: string;
        };
        if (cancelled) return;
        if (response.status === 400 || response.status === 404) return setView({ kind: "unknown" });
        if (!response.ok || !body.ok || !body.status) return setView({ kind: "unavailable" });

        const details = { amountCents: body.amountCents ?? 0, currency: body.currency ?? "usd", frequency: body.frequency ?? "once" };
        if (body.status === "pending" || body.status === "processing") {
          polls += 1;
          if (polls < MAX_POLLS) {
            setView({ kind: body.status, ...details });
            timer = window.setTimeout(check, POLL_MS);
          } else {
            setView(body.status === "processing" ? { kind: "processing", ...details } : { kind: "waiting" });
          }
          return;
        }
        setView({ kind: body.status, ...details });
        // Counted only after the provider's signed webhook confirmed payment; no amount or identifiers.
        if (body.status === "paid") track("Donation confirmed", { frequency: details.frequency });
      } catch {
        if (!cancelled) setView({ kind: "unavailable" });
      }
    };

    timer = window.setTimeout(check, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [sessionId, round]);

  const retry = () => {
    setView({ kind: "checking" });
    setRound((n) => n + 1);
  };

  let title: string;
  let text: string;
  let action: { label: string; href?: string; retry?: boolean } | null = null;

  switch (view.kind) {
    case "checking":
    case "pending":
      title = "Confirming your gift";
      text = "We're waiting for confirmation from the payment provider. This usually takes a few seconds.";
      break;
    case "paid":
      title = "Thank you";
      text = `Your ${view.frequency === "monthly" ? "monthly " : ""}gift of ${money(view.amountCents, view.currency)} is confirmed. A receipt has been sent to your email by our payment provider.`;
      action = { label: "Back to the homepage", href: "/" };
      break;
    case "processing":
      title = "Your payment is processing";
      text = `Your gift of ${money(view.amountCents, view.currency)} has been submitted. Some payment methods take a few days to complete; it will be confirmed once the payment provider receives the funds.`;
      break;
    case "failed":
      title = "The payment did not go through";
      text = "No gift was recorded. You can try again with a different payment method.";
      action = { label: "Try again", href: "/donate" };
      break;
    case "expired":
      title = "Checkout was not completed";
      text = "This checkout session ended without a payment, so nothing was charged.";
      action = { label: "Start again", href: "/donate" };
      break;
    case "waiting":
      title = "Still waiting for confirmation";
      text = "We haven't received confirmation from the payment provider yet. If you completed checkout, you will receive an emailed receipt, and this page will show the confirmation when it arrives.";
      action = { label: "Check again", retry: true };
      break;
    case "unavailable":
      title = "We can't check this gift right now";
      text = `Please try again in a moment. If you completed checkout, your emailed receipt is your confirmation; questions to ${contact.email}.`;
      action = { label: "Check again", retry: true };
      break;
    default:
      title = "We couldn't find this donation";
      text = "This link doesn't match a donation started on this site. If you completed a gift, your emailed receipt is your confirmation.";
      action = { label: "Go to the donate page", href: "/donate" };
  }

  return (
    <div className={styles.statusCard} role="status" aria-live="polite" data-state={view.kind}>
      <h2 className={styles.statusTitle}>{title}</h2>
      <p>{text}</p>
      {action?.href ? (
        <Link href={action.href} className={styles.statusAction}>
          {action.label}
        </Link>
      ) : action?.retry ? (
        <button type="button" onClick={retry} className={styles.statusAction}>
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
