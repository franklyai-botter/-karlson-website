import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: process.env.NEXT_IMAGES_UNOPTIMIZED === "true",
  },
};

export default nextConfig;
