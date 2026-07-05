import type { NextConfig } from "next";

/**
 * ────────────────────────────────────────────────────────────
 *  DEPLOY PATH — change this ONE line to move the app.
 *    "/sidewalkdemo" → serves at  example.com/sidewalkdemo
 *    ""              → serves at the domain root (subdomain)
 * ────────────────────────────────────────────────────────────
 */
const BASE_PATH = "/sidewalkdemo";

const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  images: {
    // No image optimization server needed — keeps the app portable.
    unoptimized: true,
  },
};

export default nextConfig;
