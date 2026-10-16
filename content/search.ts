import { matchEntries, type SearchEntry } from "@/lib/search-match";

import { causeHref, causes } from "./causes";
import { feedHref, feedMeta, publishedFeed } from "./feed";
import { eventWhenLine } from "./event-view";
import { albumHref, albums } from "./gallery";
import { published } from "./meta";
import { pages } from "./pages";
import { reports } from "./reports";

export type { SearchEntry };

const KIND_TYPE = { news: "News", event: "Event", story: "Story" } as const;

/**
 * Built only from published, public records: pages, causes, news, events, stories, gallery albums and
 * reports. Form submissions, applications and drafts are never indexed.
 */
export function searchIndex(): SearchEntry[] {
  return [
    ...published(causes).map((cause) => ({
      type: "Cause" as const,
      title: cause.title,
      summary: cause.short,
      href: causeHref(cause.slug),
    })),
    ...publishedFeed().map((item) => ({
      type: KIND_TYPE[item.kind],
      title: item.title,
      summary: item.kind === "event" ? `${item.excerpt} ${item.category} ${item.location ?? ""}` : item.excerpt,
      href: feedHref(item),
      meta: item.kind === "event" ? `${feedMeta(item).split(" · ")[0]} · ${eventWhenLine(item)}` : feedMeta(item),
    })),
    ...published(albums).map((album) => ({
      type: "Gallery" as const,
      title: album.title,
      summary: album.excerpt,
      href: albumHref(album.slug),
    })),
    // Reports link to the reports page, which shows the period and offers the file only if it exists.
    ...published(reports).map((report) => ({
      type: "Report" as const,
      title: report.title,
      summary: report.description,
      href: "/reports",
    })),
    ...Object.values(pages)
      .filter((page) => page.href !== "/search")
      .map((page) => ({ type: "Page" as const, title: page.title, summary: page.description, href: page.href })),
  ];
}

export function search(query: string): SearchEntry[] {
  return matchEntries(searchIndex(), query);
}
