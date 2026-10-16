import type { Metadata } from "next";

import { ActionRow } from "@/components/page/ActionRow";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { heroSlides } from "@/content/hero";
import { joinCopy, volunteerCopy } from "@/content/involvement";
import { resolveMedia } from "@/content/media";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: pages.getInvolved.label, description: pages.getInvolved.description, path: pages.getInvolved.href });

const slide = heroSlides.find((item) => item.id === "build");

/** Three clear paths (membership, volunteering, partnership), plus giving. */
export default function GetInvolvedPage() {
  return (
    <>
      <PageIntro
        label={pages.getInvolved.label}
        title={pages.getInvolved.title}
        lead={slide?.text}
        media={slide ? resolveMedia(slide.media) : undefined}
      />
      <PageSection id="membership" title="Become a member">
        <p>{joinCopy.intro}</p>
        <ActionRow actions={[{ label: "Ask to join", href: pages.join.href, primary: true }]} />
      </PageSection>
      <PageSection id="volunteer" title="Volunteer" tone="mist">
        <p>{volunteerCopy.intro}</p>
        <ActionRow actions={[{ label: "Offer your time", href: pages.volunteer.href, primary: true }]} />
      </PageSection>
      <PageSection id="partnerships" title="Partner with us">
        <p>
          Organizations, businesses and sponsors who share the club&apos;s commitment to culture, education and service are
          welcome to get in touch about working together.
        </p>
        <ActionRow actions={[{ label: "Start a conversation", href: "/contact?topic=Partnership#message", primary: true }]} />
      </PageSection>
      <PageSection id="give" title="Give" tone="mist">
        <p>Gifts support culture, education and humanitarian service in Louisiana and Lagos.</p>
        <ActionRow actions={[{ label: "Donate", href: pages.donate.href, primary: true }, { label: "Upcoming events", href: "/events" }]} />
      </PageSection>
    </>
  );
}
