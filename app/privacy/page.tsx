import type { Metadata } from "next";

import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { PolicyBody } from "@/components/page/PolicyBody";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { policyReview, privacySections } from "@/content/policies";
import { configuredServices } from "@/lib/server/services";

export const metadata: Metadata = pageMetadata({ title: pages.privacy.title, description: pages.privacy.description, path: pages.privacy.href });

export default function PrivacyPage() {
  return (
    <>
      <PageIntro label={pages.privacy.label} title={pages.privacy.title} />
      <PageSection id="notice" title="Privacy notice">
        <PolicyBody
          sections={privacySections(configuredServices())}
          updated={policyReview.updated}
          draft={!policyReview.review.verified}
        />
      </PageSection>
    </>
  );
}
