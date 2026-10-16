import "server-only";

import { isDeliveryConfigured, type FormKind } from "./deliver";
import { getStore } from "./store";
import { stripeConfig } from "./stripe";

export interface ConfiguredServices {
  /** Forms whose submissions currently reach a configured service. */
  forms: Record<FormKind, boolean>;
  store: "upstash" | "file" | null;
  donations: boolean;
  analytics: string | null;
}

/** What is switched on in this deployment, so policy pages describe the real system. */
export function configuredServices(): ConfiguredServices {
  const kinds: FormKind[] = ["contact", "newsletter", "membership", "volunteer", "rsvp"];
  const store = getStore();
  return {
    forms: Object.fromEntries(kinds.map((kind) => [kind, isDeliveryConfigured(kind)])) as Record<FormKind, boolean>,
    store: store?.kind ?? null,
    donations: Boolean(stripeConfig().config && store),
    analytics: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? "Plausible Analytics" : null,
  };
}
