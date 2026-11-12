"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { DialogHost } from "@/components/forms/DialogHost";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { RouteTransition } from "@/components/motion/RouteTransition";
import { footerColumns, headerData, legalLinks } from "@/content/navigation";
import type { publicNavigation } from "@/lib/supabase/content";
import { settings as defaultSite } from "@/content/site";

const PRIVATE_PREFIXES = ["/login", "/signup", "/forgot-password", "/reset-password", "/member", "/admin"];

export function SiteChrome({ children, navigation }: { children: ReactNode; navigation: Awaited<ReturnType<typeof publicNavigation>> | null }) {
  const site = navigation?.site ?? defaultSite;
  const pathname = usePathname();
  const privateRoute = PRIVATE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  return (
    <>
      {!privateRoute ? <SiteHeader data={navigation?.header ?? {...headerData,events:{...headerData.events,cards:[]},search:{...headerData.search,index:headerData.search.index.filter(e=>e.type!=="Event"&&e.type!=="Gallery")}}} /> : null}
      <main id="main" tabIndex={-1}>{children}</main>
      {!privateRoute ? <RouteTransition /> : null}
      {!privateRoute ? (
        <Suspense>
          <SiteFooter siteName={site.name} legalLine={site.legalLine} columns={navigation?.columns ?? footerColumns} legalLinks={legalLinks} />
          <DialogHost fallback={{ email: site.contact.email, phone: site.contact.phone.display }} />
        </Suspense>
      ) : null}
    </>
  );
}
