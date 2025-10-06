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
};

export default nextConfig;
