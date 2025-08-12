// next.config.ts or next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.sellerpintar.com",
        port: "",
        pathname: "/**", // Allows all paths under s3.sellerpintar.com
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        port: "",
        pathname: "/api/**", // Specific to the avatar generation endpoint
      },
    ],
  },
};

export default nextConfig;