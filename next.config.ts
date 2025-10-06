import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow base64 data URIs for tenant logos
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Allow data URIs (base64 images)
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Disable Turbopack for production builds (Vercel)
  // Only use webpack for production to avoid lightningcss native module issues
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
