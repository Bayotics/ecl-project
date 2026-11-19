"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import Script from "next/script";
import { useSyncExternalStore } from "react";

import { onCookieChoice, readCookieChoice } from "@/lib/cookie-consent";

/**
 * Cookieless visitor and traffic counts, never loaded for visitors who declined in the cookie notice.
 * - Vercel Web Analytics: page views, visitors, referrers, countries and devices, shown on the project's
 *   Analytics tab in Vercel (switch it on there). Counts only on Vercel deployments, not locally.
 * - Plausible (or a compatible self-hosted instance), only when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set.
 *   Custom conversion events are sent with `track()` from lib/analytics.ts.
 * Both load after the page is interactive, so they never delay the homepage sequence, and both count
 * client-side navigations themselves.
 */
export function Analytics() {
  // Off in the server render; in the browser, on unless the visitor declined.
  const allowed = useSyncExternalStore(onCookieChoice, () => readCookieChoice() !== "declined", () => false);

  if (!allowed) return null;
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const src = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js";
  return (
    <>
      <VercelAnalytics />
      {domain ? <PlausibleScripts domain={domain} src={src} /> : null}
    </>
  );
}

function PlausibleScripts({ domain, src }: { domain: string; src: string }) {
  return (
    <>
      <Script id="analytics-queue" strategy="afterInteractive">
        {"window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}"}
      </Script>
      <Script src={src} data-domain={domain} strategy="afterInteractive" />
    </>
  );
}
