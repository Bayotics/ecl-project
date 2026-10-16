// Card view-models for listing pages, built from the same published records as the homepage.
import type { CardItem } from "@/components/page/CardGrid";

import { causeHref, causes } from "./causes";
import { feedHref, feedMeta, publishedNews, publishedStories } from "./feed";
import { albumHref, albums } from "./gallery";
import { resolveMedia } from "./media";
import { formatPartialDate, published } from "./meta";
import type { FeedItem, Story } from "./types";

export const causeCards = (): CardItem[] =>
  published(causes).map((cause) => ({
    href: causeHref(cause.slug),
    title: cause.title,
    summary: cause.short,
    meta: cause.number,
    media: resolveMedia(cause.media),
  }));

const feedCard = (item: FeedItem): CardItem => ({
  href: feedHref(item),
  title: item.title,
  summary: item.excerpt,
  meta: feedMeta(item),
  media: resolveMedia(item.media),
});

export const newsCards = (): CardItem[] => publishedNews().map(feedCard);

/** Published stories, optionally filtered (e.g. by program or volunteer highlight). */
export const storyCards = (filter: (story: Story) => boolean = () => true): CardItem[] =>
  publishedStories().filter(filter).map(feedCard);

export const albumCards = (): CardItem[] =>
  published(albums).map((album) => ({
    href: albumHref(album.slug),
    title: album.title,
    summary: album.excerpt,
    meta: album.date ? formatPartialDate(album.date) : undefined,
    media: resolveMedia(album.cover),
  }));
