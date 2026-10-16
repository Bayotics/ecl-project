import type { Story } from "./types";

/**
 * Impact stories and volunteer highlights, shown at /impact/[slug] and on the matching program page.
 * Empty until the club supplies real ones; never add invented stories, testimonials or quotes.
 * Shape reference: content/types.ts → Story (`cause` links it to a program; `volunteerHighlight`
 * lists it under volunteer highlights).
 */
export const stories: Story[] = [];
