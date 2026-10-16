import type { PartialDate, Provenance, RecordMeta, Review } from "./types";

/** Only published records may render publicly, appear in menus, search, sitemaps or static params. */
export function published<T extends RecordMeta>(records: readonly T[]): T[] {
  return records.filter((record) => record.status === "published");
}

export const BRIEF_2: Provenance = { source: "brief-prompt-2", note: "Prompt 2 — ECL draft copy" };
export const DRAFT: Provenance = { source: "editorial-draft", note: "Written for the redesign from the Prompt 1/2 mission summary" };

/** Approved brief copy: ready to publish, still worth a final read-through by the club. */
export const briefReview = (...notes: string[]): Review => ({
  verified: false,
  notes: ["Draft copy supplied in the brief; confirm wording with the club before launch.", ...notes],
});

export const draftReview = (...notes: string[]): Review => ({
  verified: false,
  notes: ["Editorial draft written for the redesign; confirm wording with the club.", ...notes],
});

export const meta = (provenance: Provenance, review: Review, status: RecordMeta["status"] = "published"): RecordMeta => ({
  status,
  provenance,
  review,
});

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2021", "December 2018" or "8 December 2018", matching the date's known precision. */
export function formatPartialDate(date: PartialDate): string {
  const [year, month, day] = date.value.split("-");
  if (date.precision === "year" || !month) return year;
  const monthName = MONTHS[Number(month) - 1];
  if (date.precision === "month" || !day) return `${monthName} ${year}`;
  return `${Number(day)} ${monthName} ${year}`;
}

/** Sort key: undated records (e.g. "set at launch") sort as newest. */
export function dateSortKey(date: PartialDate | null): string {
  return date ? date.value : "9999";
}
