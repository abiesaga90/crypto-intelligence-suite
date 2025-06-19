import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during build for development
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during build for development
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
