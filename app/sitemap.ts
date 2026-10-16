import type { MetadataRoute } from "next";

import { causeHref, causes } from "@/content/causes";
import { feedHref, publishedFeed } from "@/content/feed";
import { albumHref, albums } from "@/content/gallery";
import { published } from "@/content/meta";
import { pages } from "@/content/pages";
import { settings } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "/",
    ...Object.values(pages)
      .map((page) => page.href)
      .filter((href) => href !== "/search" && !href.startsWith("/donate/")),
    ...published(causes).map((cause) => causeHref(cause.slug)),
    ...publishedFeed().map((item) => feedHref(item)),
    ...published(albums).map((album) => albumHref(album.slug)),
  ];
  return [...new Set(routes)].map((route) => ({ url: new URL(route, settings.url).toString() }));
}
