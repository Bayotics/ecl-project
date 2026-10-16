// Privacy-friendly analytics (Plausible-compatible). The script loads only when
// NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set; without it these calls do nothing. No cookies are used.

type Plausible = (event: string, options?: { props?: Record<string, string | number> }) => void;

/** Records a named conversion, e.g. "Membership request". Never pass personal details. */
export function track(event: string, props?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  const plausible = (window as unknown as { plausible?: Plausible }).plausible;
  plausible?.(event, props ? { props } : undefined);
}
