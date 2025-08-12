import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['s3.sellerpintar.com'], // Add the hostname
  },
};

export default nextConfig;
