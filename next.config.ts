import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/articles',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
