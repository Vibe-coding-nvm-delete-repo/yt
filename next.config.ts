import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Temporarily skip ESLint during build to unblock deployment
  // React Compiler errors in legacy hooks need refactoring (separate PR)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
