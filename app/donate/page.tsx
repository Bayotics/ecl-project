import type { Metadata } from "next";

import { DonateForm } from "@/components/donate/DonateForm";
import donateStyles from "@/components/donate/donate.module.css";
import { ActionRow } from "@/components/page/ActionRow";
import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import { donationSettings, publishedDesignations } from "@/content/donations";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { settings } from "@/content/site";
import { donationAvailability } from "@/lib/server/donations";

export const metadata: Metadata = pageMetadata({ title: pages.donate.label, description: pages.donate.description, path: pages.donate.href });

/**
 * Short donation entry. Checkout happens on the provider's hosted page; when the provider or data store
 * is not configured, the page says so plainly and offers another way to give instead of a dead button.
 * Rendered per request so configuration changes and the "checkout canceled" notice apply immediately.
 */
export default async function DonatePage({ searchParams }: PageProps<"/donate">) {
  const { checkout } = await searchParams;
  const availability = donationAvailability();
  const { email, phone } = settings.contact;

  return (
    <>
      <PageIntro label={pages.donate.label} title={pages.donate.title} lead={pages.donate.lead} />
      <PageSection id="give" title="Make a gift">
        {checkout === "canceled" ? (
          <p className={donateStyles.notice} role="status">
            Checkout was canceled and nothing was charged. You can start again below whenever you are ready.
          </p>
        ) : null}
        {availability.available ? (
          <DonateForm
            presets={donationSettings.presets}
            min={donationSettings.min}
            max={donationSettings.max}
            currency={donationSettings.currency}
            designations={publishedDesignations().map(({ id, label }) => ({ id, label }))}
            recurring={availability.recurring}
          />
        ) : (
          <div className={donateStyles.statusCard} data-state="unavailable">
            <h3 className={donateStyles.statusTitle}>Online giving is being set up</h3>
            <p>
              Secure online donations are not available on this website yet. To give now, or to ask about other ways to
              support the club, please contact us and we will be glad to help.
            </p>
            <ActionRow
              actions={[
                { label: `Email ${email}`, href: `mailto:${email}?subject=Donation`, primary: true },
                { label: `Call ${phone.display}`, href: `tel:${phone.tel}` },
              ]}
            />
          </div>
        )}
      </PageSection>
      <PageSection id="how" title="How your gift is handled" tone="mist">
        <p>
          Payments are processed by Stripe on its own secure checkout page. Eko Club Louisiana never sees or stores card
          details. A gift is shown as confirmed only after the payment provider notifies the club that the payment
          succeeded, and you will receive a receipt by email from the provider.
        </p>
        <ActionRow actions={[{ label: "Reports", href: "/reports" }, { label: "Our impact", href: "/impact" }]} />
      </PageSection>
    </>
  );
}
