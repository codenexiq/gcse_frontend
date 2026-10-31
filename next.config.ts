import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";

// Security headers sent with every response.
// (The Content-Security-Policy is built per request in src/proxy.ts.)
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" }, // nobody can put our site in an iframe
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ...(isProduction
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // do not advertise "X-Powered-By: Next.js"

  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Keep the tutor area out of search engines.
      { source: "/tutor/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },

  // The browser only ever talks to our own origin; Next forwards /api/* to Express.
  // This keeps the session cookie first-party and means the backend needs no public CORS.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/:path*` }];
  },
};

export default nextConfig;
