import type { Metadata } from "next";

import { pageMetadata } from "@/lib/seo";

import { DonationStatus } from "@/components/donate/DonationStatus";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { settings } from "@/content/site";

export const metadata: Metadata = pageMetadata({ title: "Your gift", description: "Donation status.", path: "/donate/thank-you", noindex: true });

/**
 * Return page from checkout. Arriving here proves nothing about payment: the status shown comes only
 * from what verified provider webhooks have recorded.
 */
export default async function ThankYouPage({ searchParams }: PageProps<"/donate/thank-you">) {
  const { session_id: sessionId } = await searchParams;
  return (
    <>
      <PageIntro label="Donate" title="Your gift" />
      <PageSection id="status" title="Status">
        <DonationStatus sessionId={typeof sessionId === "string" ? sessionId : null} contact={{ email: settings.contact.email }} />
      </PageSection>
    </>
  );
}
