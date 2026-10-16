import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geologica } from "next/font/google";

import "lenis/dist/lenis.css";
import "./globals.css";

import { DialogHost } from "@/components/forms/DialogHost";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { RouteTransition } from "@/components/motion/RouteTransition";
import { Analytics } from "@/components/providers/Analytics";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { footerColumns, headerData, legalLinks } from "@/content/navigation";
import { settings as site } from "@/content/site";
import { DEFAULT_IMAGE } from "@/lib/seo";

// Variable font, loaded once. Weights in use: 200 headings, 300 copy, 500 labels.
const geologica = Geologica({
  subsets: ["latin"],
  variable: "--font-geologica",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | A shared legacy`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    url: "/",
    images: [DEFAULT_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [DEFAULT_IMAGE.url] },
};

export const viewport: Viewport = {
  themeColor: "#eeeeeb",
  // Draw edge to edge on notched phones; gutters and bottom bars add the safe-area insets.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={geologica.variable}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <span id="top" className="page-top" tabIndex={-1} />
        <SmoothScrollProvider>
          <SiteHeader data={headerData} />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <RouteTransition />
          {/* Hydrated after the header and page content, in their own chunks. */}
          <Suspense>
            <SiteFooter
              siteName={site.name}
              legalLine={site.legalLine}
              columns={footerColumns}
              legalLinks={legalLinks}
            />
            <DialogHost fallback={{ email: site.contact.email, phone: site.contact.phone.display }} />
          </Suspense>
        </SmoothScrollProvider>
        <Analytics />
      </body>
    </html>
  );
}
