import type { Metadata } from "next";

import { ChangeCookieChoice } from "@/components/layout/CookieNotice/CookieNotice";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { PolicyBody } from "@/components/page/PolicyBody";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { cookieSections } from "@/content/policies";
import { configuredServices } from "@/lib/server/services";

export const metadata: Metadata = pageMetadata({ title: pages.cookies.title, description: pages.cookies.description, path: pages.cookies.href });

export default function CookiesPage() {
  const services = configuredServices();
  return (
    <>
      <PageIntro label={pages.cookies.label} title={pages.cookies.title} />
      <PageSection id="use" title="How cookies are used">
        <PolicyBody sections={cookieSections(services)} />
      </PageSection>
      <PageSection id="preferences" title="Preferences" tone="mist">
        <p>
          The website sets no optional cookies, so there is nothing else to switch on or off. If you decline in the
          cookie notice, visit counting is not loaded either. If anything optional is ever added, your choices will be
          available here before it is used.
        </p>
        <p>
          <ChangeCookieChoice />
        </p>
      </PageSection>
    </>
  );
}
