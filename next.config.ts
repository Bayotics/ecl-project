import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Uploaded media is served from the Cloudflare R2 bucket's public address.
    remotePatterns: process.env.R2_PUBLIC_URL ? [{ protocol: "https" as const, hostname: new URL(process.env.R2_PUBLIC_URL).hostname, pathname: "/**" }] : [],
    // WebP only: as sharp as AVIF at this quality but many times faster to generate on first view.
    formats: ["image/webp"],
    // Each resized image is generated once and then served from the CDN for a year. Uploaded and
    // bundled files never change under the same address, so this is safe.
    minimumCacheTTL: 31536000,
    // Photographs are served at 90 (MediaImage); 75 stays available for other images.
    qualities: [75, 90],
  },
  // Keep existing URL value: addresses from the previous WordPress site and earlier builds of this one.
  // (Trailing-slash forms such as /history/ are normalised by Next.js first, then matched here.)
  async redirects() {
    const convention = "/events/2021-eci-biennial-convention";
    const inauguration = "/events/inauguration-and-eci-quarterly-meeting-2018";
    return [
      // Previous WordPress site.
      { source: "/history", destination: "/about/history", permanent: true },
      { source: "/contact-2", destination: "/contact", permanent: true },
      { source: "/2021-eci-biennial-convention-coming-up-in-louisiana", destination: convention, permanent: true },
      // Earlier routes of this site.
      { source: "/causes", destination: "/programs", permanent: true },
      { source: "/causes/:slug", destination: "/programs/:slug", permanent: true },
      { source: "/our-work", destination: "/impact", permanent: true },
      { source: "/get-involved/membership", destination: "/join", permanent: true },
      { source: "/get-involved/volunteer", destination: "/volunteer", permanent: true },
      { source: "/get-involved/partner", destination: "/get-involved#partnerships", permanent: true },
      { source: "/news/2021-convention", destination: convention, permanent: true },
      { source: "/news/inauguration-and-eci-quarterly-meeting-2018", destination: inauguration, permanent: true },
      { source: "/news-events/2021-convention", destination: convention, permanent: true },
      { source: "/news-events/inauguration-and-eci-quarterly-meeting-2018", destination: inauguration, permanent: true },
      { source: "/news-events", destination: "/news", permanent: true },
      { source: "/news-events/:slug", destination: "/news/:slug", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Fonts never change under the same name: cache for a year in browsers and the CDN.
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      // Site media (videos, portraits): cache for 30 days, refresh in the background after that.
      { source: "/media/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }] },
    ];
  },
};

export default nextConfig;
