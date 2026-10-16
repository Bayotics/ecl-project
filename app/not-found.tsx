import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { ActionLink } from "@/components/ui/ActionLink";

export default function NotFound() {
  return (
    <>
      <PageIntro
        label="Page not found"
        title="We couldn't find that page"
        lead="It may have moved, or the link may be out of date."
      />
      <PageSection id="next" title="Where next">
        <ActionLink href="/">Back to the homepage</ActionLink>
      </PageSection>
    </>
  );
}
