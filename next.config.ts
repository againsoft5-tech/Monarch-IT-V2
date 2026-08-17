import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.monarchit.com.bd",
      },
      {
        protocol: "https",
        hostname: "monarchit.com.bd",
      },
      {
        protocol: "https",
        hostname: "www.startech.com.bd",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
};

export default nextConfig;
