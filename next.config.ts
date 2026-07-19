import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/knowledge-hub',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
