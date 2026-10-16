import type { Metadata } from "next";

import { JoinForm } from "@/components/forms/JoinForm";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import styles from "@/components/page/page.module.css";
import { joinCopy, programInterests } from "@/content/involvement";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { settings } from "@/content/site";

export const metadata: Metadata = pageMetadata({ title: pages.join.title, description: pages.join.description, path: pages.join.href });

/** Membership request. No fees, dues or acceptance criteria are stated until the club supplies them. */
export default function JoinPage() {
  const { email, phone } = settings.contact;
  return (
    <>
      <PageIntro label={pages.join.label} title={pages.join.title} lead={joinCopy.intro} />
      <PageSection id="request" title="Ask to join">
        <p className={styles.notice}>{joinCopy.notice}</p>
        <JoinForm interests={programInterests()} acknowledge={joinCopy.acknowledge} fallback={{ email, phone: phone.display }} />
      </PageSection>
      <PageSection id="questions" title="Questions" tone="mist">
        <p>
          For questions about membership, email <a href={`mailto:${email}`}>{email}</a> or call{" "}
          <a href={`tel:${phone.tel}`}>{phone.display}</a>.
        </p>
      </PageSection>
    </>
  );
}
