import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async headers() {
    return [
      {
        /* Safe-by-default security headers (batch-7 launch audit).
         * Deliberately NOT setting X-Frame-Options / frame-ancestors:
         * the app must remain embeddable by the authorized preview
         * environment, and Vercel-managed previews rely on framing. */
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
