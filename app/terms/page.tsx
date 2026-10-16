import type { Metadata } from "next";

import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { Pending } from "@/components/page/Pending";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: pages.terms.title, description: pages.terms.description, path: pages.terms.href });

export default function TermsPage() {
  return (
    <>
      <PageIntro label={pages.terms.label} title={pages.terms.title} />
      <PageSection id="terms" title="Terms">
        {/* Legal text must come from the club; do not draft it here. */}
        <Pending topic="the terms of use for this website" />
      </PageSection>
    </>
  );
}
