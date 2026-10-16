import type { MetadataRoute } from "next";

import { settings } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/search"] }],
    sitemap: new URL("/sitemap.xml", settings.url).toString(),
  };
}
