import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['firebase-admin'],
  outputFileTracingIncludes: {
    '/**/*': ['./prisma/prisma/dev.db'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
