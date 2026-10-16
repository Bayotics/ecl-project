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
    formats: ["image/avif", "image/webp"],
    qualities: [75],
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
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
