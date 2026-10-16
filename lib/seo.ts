import type { Metadata } from "next";
import type { StaticImageData } from "next/image";

import ogDefault from "@/assets/media/og-default.jpg";
import { settings } from "@/content/site";
import type { ResolvedMedia } from "@/content/types";

/** Authentic default social preview: the 2018 group photograph, cropped to 1200×630. */
export const DEFAULT_IMAGE = {
  url: ogDefault.src,
  width: ogDefault.width,
  height: ogDefault.height,
  alt: "Eko Club Louisiana members in white attire and Eko Louisiana stoles, gathered in front of a stage.",
};

interface PageMetaInput {
  title?: string;
  description: string;
  /** Route path, used for the canonical URL and og:url (resolved against metadataBase). */
  path: string;
  /** A record's own photograph for social previews; defaults to the club photograph. */
  image?: ResolvedMedia | { src: StaticImageData; alt: string };
  type?: "website" | "article";
  noindex?: boolean;
}

/**
 * Per-page metadata: title, description, canonical URL, Open Graph and Twitter cards. Open Graph is
 * written in full on every page because Next.js replaces (does not merge) nested metadata objects.
 */
export function pageMetadata({ title, description, path, image, type = "website", noindex }: PageMetaInput): Metadata {
  const picture = image ? { url: image.src.src, width: image.src.width, height: image.src.height, alt: image.alt } : DEFAULT_IMAGE;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: settings.name,
      locale: settings.locale,
      url: path,
      ...(title ? { title } : {}),
      description,
      images: [picture],
    },
    twitter: { card: "summary_large_image", ...(title ? { title } : {}), description, images: [picture.url] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
