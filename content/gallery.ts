import { published } from "./meta";
import type { GalleryAlbum } from "./types";

/**
 * Photo albums. Each photo is an asset from content/media.ts plus an optional caption; the album page
 * opens them in an accessible lightbox. Add only photographs the club has the right to publish.
 */
export const albums: GalleryAlbum[] = [
  {
    slug: "inauguration-and-eci-quarterly-meeting-2018",
    title: "Inauguration and ECI quarterly meeting",
    excerpt: "Eko Club Louisiana members photographed at the December 2018 inauguration and ECI quarterly meeting.",
    date: { value: "2018-12", precision: "month" },
    cover: { asset: "eclGroup2018", focal: { x: 50, y: 55 } },
    photos: [
      {
        media: { asset: "eclGroup2018" },
        caption:
          "Members of Eko Club Louisiana in white attire and Eko Louisiana stoles at the December 2018 inauguration and ECI quarterly meeting.",
      },
    ],
    status: "published",
    provenance: {
      source: "ekoclublouisiana.org",
      url: "https://ekoclublouisiana.org/wp-content/uploads/2021/08/group-pic.png",
      note: "Single photograph from the existing homepage; album title and month read from its stage banner.",
    },
    review: {
      verified: false,
      notes: ["Add the rest of the event's photographs if the club has them; confirm the date and photographer credit."],
    },
  },
];

export const albumHref = (slug: string) => `/gallery/${slug}`;

export function getAlbum(slug: string): GalleryAlbum | undefined {
  return published(albums).find((album) => album.slug === slug);
}
