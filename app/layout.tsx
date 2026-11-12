import { publicNavigation } from "@/lib/supabase/content";
import type { Metadata, Viewport } from "next";
import { Geologica } from "next/font/google";

import "lenis/dist/lenis.css";
import "./globals.css";

import { SiteChrome } from "@/components/layout/SiteChrome";
import { Analytics } from "@/components/providers/Analytics";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { settings as site } from "@/content/site";
import { DEFAULT_IMAGE } from "@/lib/seo";

// Variable Geologica with the CRSV axis (the reference's letterforms), self-hosted at build time so the
// live site never requests Google Fonts. Weights in use: 200 headings, 300 copy, 500 labels.
const geologica = Geologica({
  subsets: ["latin"],
  axes: ["CRSV"],
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

export const dynamic = "force-dynamic";
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const navigation = await publicNavigation().catch(() => null);
  return (
    <html lang="en" className={geologica.variable}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <span id="top" className="page-top" tabIndex={-1} />
        <SmoothScrollProvider>
          <SiteChrome navigation={navigation}>{children}</SiteChrome>
        </SmoothScrollProvider>
        <Analytics />
      </body>
    </html>
  );
}
