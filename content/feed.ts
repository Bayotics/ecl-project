import { events } from "./events";
import { dateSortKey, formatPartialDate, published } from "./meta";
import { news } from "./news";
import { stories } from "./stories";
import type { FeedItem } from "./types";

/** News at /news and events at /events; a story belongs to its program page (or all programs). */
export function feedHref(item: Pick<FeedItem, "kind" | "slug">): string {
  if (item.kind === "event") return `/events/${item.slug}`;
  if (item.kind === "story") return "cause" in item && item.cause ? `/programs/${item.cause}` : "/programs";
  return `/news/${item.slug}`;
}

export function allFeedItems(): FeedItem[] {
  return [...stories, ...news, ...events];
}

/** Published items, newest first (undated items such as launch news first). */
export function publishedFeed(): FeedItem[] {
  return published(allFeedItems()).sort((a, b) => dateSortKey(b.date).localeCompare(dateSortKey(a.date)));
}

export function feedLabel(item: FeedItem): string {
  // Past events are shown explicitly as archived history, never as upcoming.
  if (item.kind === "event") return item.historical ? "Archive" : "Event";
  return item.kind === "news" ? "News" : "Story";
}

/** "Archive · December 2018" */
export function feedMeta(item: FeedItem): string {
  return item.date ? `${feedLabel(item)} · ${formatPartialDate(item.date)}` : feedLabel(item);
}

/** Published news, newest first. Only dated items are listed. */
export function publishedNews() {
  return published(news)
    .filter((item) => item.date)
    .sort((a, b) => dateSortKey(b.date).localeCompare(dateSortKey(a.date)));
}

export const getNewsItem = (slug: string) => publishedNews().find((item) => item.slug === slug);

export function publishedStories() {
  return published(stories).sort((a, b) => dateSortKey(b.date).localeCompare(dateSortKey(a.date)));
}

export const getStory = (slug: string) => publishedStories().find((item) => item.slug === slug);
