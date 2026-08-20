import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Statischer Export nach ./out — von Cloudflare Workers als Assets ausgeliefert.
  output: "export",
  // Kein Sharp/Image-Optimizer auf Cloudflare, Bilder gehen unverändert raus.
  images: {
    unoptimized: true,
  },
  // Erzeugt /termine/index.html statt /termine.html — nötig für saubere URLs.
  trailingSlash: true,
};

export default nextConfig;
