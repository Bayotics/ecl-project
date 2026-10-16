import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { pageMetadata } from "@/lib/seo";

import { AlbumGallery } from "@/components/gallery/AlbumGallery";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { albums, getAlbum } from "@/content/gallery";
import { assets, resolveMedia } from "@/content/media";
import { formatPartialDate, published } from "@/content/meta";

export const dynamicParams = false;

export function generateStaticParams() {
  return published(albums).map((album) => ({ slug: album.slug }));
}

export async function generateMetadata({ params }: PageProps<"/gallery/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const album = getAlbum(slug);
  return album ? pageMetadata({ title: `${album.title}: photographs`, description: album.excerpt, path: `/gallery/${album.slug}`, image: resolveMedia(album.cover) }) : {};
}

export default async function AlbumPage({ params }: PageProps<"/gallery/[slug]">) {
  const { slug } = await params;
  const album = getAlbum(slug);
  if (!album) notFound();

  const photos = album.photos.map((photo) => ({
    // Album photos are shown uncropped, at their own proportions.
    media: resolveMedia({ asset: photo.media.asset, alt: photo.media.alt }),
    caption: photo.caption,
    credit: assets[photo.media.asset].credit,
  }));

  return (
    <>
      <PageIntro
        label={album.date ? `Gallery · ${formatPartialDate(album.date)}` : "Gallery"}
        title={album.title}
        lead={album.excerpt}
      />
      <PageSection id="photos" title={`Photographs (${photos.length})`}>
        <AlbumGallery title={album.title} photos={photos} />
      </PageSection>
    </>
  );
}
