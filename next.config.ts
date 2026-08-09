import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The build prerenders ~1,200 DB-backed pages; the default 60s per-page
  // budget leaves no headroom for the heaviest ones under load.
  staticPageGenerationTimeout: 180,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
