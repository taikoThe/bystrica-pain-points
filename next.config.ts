import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/pain-points',
  serverExternalPackages: ["bcryptjs"],
  images: {
    remotePatterns: [],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://*.tile.openstreetmap.org https://cdnjs.cloudflare.com; connect-src 'self' https://nominatim.openstreetmap.org; font-src 'self'; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
