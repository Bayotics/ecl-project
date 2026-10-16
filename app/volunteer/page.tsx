import type { Metadata } from "next";

import { VolunteerForm } from "@/components/forms/VolunteerForm";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { volunteerCopy, volunteerInterests } from "@/content/involvement";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { settings } from "@/content/site";

export const metadata: Metadata = pageMetadata({ title: pages.volunteer.title, description: pages.volunteer.description, path: pages.volunteer.href });

export default async function VolunteerPage({ searchParams }: PageProps<"/volunteer">) {
  const { interest } = await searchParams;
  const { email, phone } = settings.contact;
  return (
    <>
      <PageIntro label={pages.volunteer.label} title={pages.volunteer.title} lead={volunteerCopy.intro} />
      <PageSection id="sign-up" title="Offer your time">
        <VolunteerForm
          interests={volunteerInterests()}
          defaultInterest={typeof interest === "string" ? interest : undefined}
          consent={volunteerCopy.consent}
          fallback={{ email, phone: phone.display }}
        />
      </PageSection>
    </>
  );
}
