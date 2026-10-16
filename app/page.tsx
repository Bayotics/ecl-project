import type { Metadata } from "next";
import { Suspense } from "react";

import { CausesCarousel } from "@/components/sections/CausesCarousel/CausesCarousel";
import { ContactBand } from "@/components/sections/ContactBand/ContactBand";
import { CultureFeature } from "@/components/sections/CultureFeature/CultureFeature";
import { EditorialRow } from "@/components/sections/EditorialRow/EditorialRow";
import { Hero } from "@/components/sections/Hero/Hero";
import { IntroLoader } from "@/components/sections/Hero/IntroLoader";
import { IntroPanels } from "@/components/sections/IntroPanels/IntroPanels";
import { Mission } from "@/components/sections/Mission/Mission";
import { NewsEvents } from "@/components/sections/NewsEvents/NewsEvents";
import { JsonLd } from "@/components/seo/JsonLd";
import { causeHref, causes } from "@/content/causes";
import { feedHref, feedMeta, publishedFeed } from "@/content/feed";
import { heroSlides } from "@/content/hero";
import { resolveMedia } from "@/content/media";
import { published } from "@/content/meta";
import {
  causesPanel,
  causesSection,
  contactBand,
  culture,
  editorial,
  impactPanel,
  mission,
  newsSection,
  presidentAddress,
  settings,
  whatWeDo,
} from "@/content/site";
import { pageMetadata } from "@/lib/seo";
import { organizationLd } from "@/lib/structured-data";

export const metadata: Metadata = pageMetadata({ description: settings.description, path: "/" });

/**
 * Homepage — sections 1–8 in contract order (docs/ui-spec.md A4).
 * Section 9 (logo strip and footer) is the shared footer in app/layout.tsx.
 * Every block reads published records; media references are resolved here, on the server.
 */
export default function HomePage() {
  const slides = published(heroSlides).map(({ id, tab, eyebrow, headline, text, cta, media, video }) => ({
    id,
    tab,
    eyebrow,
    headline,
    text,
    cta,
    media: resolveMedia(media),
    video,
  }));

  const causeItems = published(causes).map(({ slug, number, title, short, media }) => ({
    slug,
    number,
    title,
    short,
    href: causeHref(slug),
    media: resolveMedia(media),
  }));

  const feedItems = publishedFeed()
    .slice(0, 3)
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      href: feedHref(item),
      meta: feedMeta(item),
      media: resolveMedia(item.media),
    }));

  return (
    <>
      <JsonLd data={organizationLd()} />
      <IntroLoader />
      <Hero heading={`${settings.name}: a shared legacy`} label="Featured" slides={slides} nextSectionId="mission" />
      <Mission label={mission.label} paragraphs={mission.paragraphs} video={presidentAddress} />
      {/*
        Suspense boundaries let React hydrate the sections below the hero in separate, interruptible
        chunks instead of one long task (Prompt 10 performance pass). Nothing here suspends, so the
        server HTML is identical and no fallback is ever shown.
      */}
      <Suspense>
        <IntroPanels intro={whatWeDo} impact={impactPanel} causes={causesPanel} />
      </Suspense>
      <Suspense>
        <CausesCarousel heading={causesSection.heading} causes={causeItems} />
      </Suspense>
      <Suspense>
        <CultureFeature
          label={culture.label}
          heading={culture.heading}
          link={culture.link}
          poster={culture.poster}
          video={culture.video}
          videoLabel={culture.videoLabel}
        />
        <EditorialRow
          label={editorial.label}
          heading={editorial.heading}
          paragraphs={editorial.paragraphs}
          link={editorial.link}
          media={editorial.media}
        />
      </Suspense>
      <Suspense>
        <NewsEvents heading={newsSection.heading} action={newsSection.action} items={feedItems} />
        <ContactBand
          invitation={contactBand.invitation}
          contact={contactBand.contact}
          newsletter={contactBand.newsletter}
          details={settings.contact}
        />
      </Suspense>
    </>
  );
}
