import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/recipe-generator' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/recipe-generator/' : '',
};

export default nextConfig;