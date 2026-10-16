import Script from "next/script";

/**
 * Privacy-friendly, cookieless page analytics (Plausible or a compatible self-hosted instance).
 * Loads only when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set; after the page is interactive, so it never delays
 * the homepage sequence. Client-side navigations are counted by the script itself. Custom conversion
 * events are sent with `track()` from lib/analytics.ts.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  const src = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.js";
  return (
    <>
      <Script id="analytics-queue" strategy="afterInteractive">
        {"window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}"}
      </Script>
      <Script src={src} data-domain={domain} strategy="afterInteractive" />
    </>
  );
}
