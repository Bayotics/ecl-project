// Pure, dependency-free matching shared by the /search page (server) and the header search panel (client).

export interface SearchEntry {
  type: "Page" | "Cause" | "News" | "Event" | "Story" | "Gallery" | "Report";
  title: string;
  summary: string;
  href: string;
  /** e.g. "Archive · December 2018" */
  meta?: string;
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");

/** Every term must match the title or summary; title matches rank first; one result per URL. */
export function matchEntries(entries: SearchEntry[], query: string): SearchEntry[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean).slice(0, 8);
  if (!terms.length) return [];

  const hits = entries
    .map((entry) => {
      const title = normalize(entry.title);
      const haystack = `${title} ${normalize(entry.summary)}`;
      if (!terms.every((term) => haystack.includes(term))) return null;
      const score = terms.reduce((sum, term) => sum + (title.includes(term) ? 2 : 1), 0);
      return { entry, score };
    })
    .filter((hit): hit is { entry: SearchEntry; score: number } => hit !== null)
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const results: SearchEntry[] = [];
  for (const { entry } of hits) {
    if (seen.has(entry.href)) continue;
    seen.add(entry.href);
    results.push(entry);
  }
  return results;
}
