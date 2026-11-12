import { publicSettings } from "@/lib/supabase/content";
import type { Metadata } from "next";

import { ContactForm } from "@/components/forms/ContactForm";
import { NewsletterSignup } from "@/components/forms/NewsletterSignup";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { contactBand, settings } from "@/content/site";

export const metadata: Metadata = pageMetadata({ title: pages.contact.label, description: pages.contact.description, path: pages.contact.href });

/**
 * Dedicated contact route; also the inline fallback for the contact and newsletter dialogs.
 * `?topic=Partnership` preselects the topic (links from /get-involved and /impact).
 */
export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const managed = await publicSettings();
  const contact = managed ? {email:managed.email,phone:{display:managed.phone,tel:managed.phone.replace(/[^+0-9]/g,"")},location:managed.address,streetAddress:managed.address} : settings.contact;
  const { topic } = await searchParams;
  const { email, phone, location, streetAddress } = contact;

  return (
    <>
      <PageIntro label={pages.contact.label} title={pages.contact.title} lead={contactBand.contact.body} />
      <PageSection id="reach-us" title="Reach us">
        {/* Street address withheld until the club confirms which published address is current. */}
        <address>
          <p>{managed?.organization_name ?? settings.name}</p>
          <p>{streetAddress ?? location}</p>
          <p>
            <a href={`mailto:${email}`}>{email}</a>
          </p>
          <p>
            <a href={`tel:${phone.tel}`}>{phone.display}</a>
          </p>
        </address>
      </PageSection>
      <PageSection id="message" title="Send a message" tone="mist">
        <ContactForm fallback={{ email, phone: phone.display }} defaultTopic={typeof topic === "string" ? topic : undefined} />
      </PageSection>
      <PageSection id="newsletter" title={contactBand.newsletter.heading}>
        <p>{contactBand.newsletter.body}</p>
        <NewsletterSignup />
      </PageSection>
    </>
  );
}
