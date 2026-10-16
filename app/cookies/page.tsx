import type { Metadata } from "next";

import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { PolicyBody } from "@/components/page/PolicyBody";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { cookieSections, policyReview } from "@/content/policies";
import { configuredServices } from "@/lib/server/services";

export const metadata: Metadata = pageMetadata({ title: pages.cookies.title, description: pages.cookies.description, path: pages.cookies.href });

export default function CookiesPage() {
  const services = configuredServices();
  return (
    <>
      <PageIntro label={pages.cookies.label} title={pages.cookies.title} />
      <PageSection id="use" title="How cookies are used">
        <PolicyBody sections={cookieSections(services)} updated={policyReview.updated} draft={!policyReview.review.verified} />
      </PageSection>
      <PageSection id="preferences" title="Preferences" tone="mist">
        <p>
          Because the website sets no optional cookies, there is nothing to switch on or off. If that ever changes, your
          choices will be available here before anything optional is used.
        </p>
      </PageSection>
    </>
  );
}
