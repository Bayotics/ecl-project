import type { Report } from "./types";

/**
 * Governance, financial and impact documents. Empty on purpose: never invent reports or figures.
 *
 * To publish one: put the file in `public/reports/` (e.g. `public/reports/2025-annual-report.pdf`) and
 * add a record with `file: "/reports/2025-annual-report.pdf"`. The download link (with its size) is
 * shown only when that file exists at build time.
 */
export const reports: Report[] = [];

export const reportKindLabel: Record<Report["kind"], string> = {
  governance: "Governance",
  financial: "Financial",
  impact: "Impact",
};
