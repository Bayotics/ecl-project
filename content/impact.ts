import type { Metric, Testimonial } from "./types";

/**
 * Impact figures. Empty on purpose: add a figure only when the club confirms it, with the date it was
 * true for and its source, e.g.
 *   { slug: "volunteer-hours-2025", value: "1,200", label: "Volunteer hours", asOf: "2025-12-31",
 *     source: { label: "2025 annual report", url: "/reports/2025-annual-report.pdf" }, ...meta(...) }
 * Unknown numbers stay unpublished.
 */
export const metrics: Metric[] = [];

/**
 * Testimonials. Empty on purpose: add only quotes the person has approved for publication with their
 * name (`consent: true`). Never paraphrase or invent quotes.
 */
export const testimonials: Testimonial[] = [];
