import type { Metadata } from "next";

import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: pages.accessibility.title, description: pages.accessibility.description, path: pages.accessibility.href });

export default function AccessibilityPage() {
  return (
    <>
      <PageIntro label={pages.accessibility.label} title={pages.accessibility.title} />
      <PageSection id="commitment" title="Our approach">
        <p>
          This website is designed to follow the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA. It
          supports keyboard navigation, honors reduced-motion settings, and lets you pause moving video.
        </p>
        <p>
          If something on the site is difficult to use, please tell us through the contact page so we can fix it.
        </p>
      </PageSection>
    </>
  );
}
