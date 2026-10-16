import type { Leader } from "./types";

/**
 * Officers and committee members. Empty on purpose: names, roles, photographs and bios must come from
 * the club. Never invent officers. Shape reference: content/types.ts → Leader, e.g.
 *   { slug: "jane-doe", name: "…", role: "President", term: "2025–2027", bio: "…", media: null, ...meta(...) }
 * A photograph is added to content/media.ts first, then referenced with `media: { asset: "…" }`.
 */
export const leadership: Leader[] = [];
