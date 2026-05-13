/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete
    // even if your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  compress: true,
  productionBrowserSourceMaps: false,
  reactStrictMode: true,
  compiler: {
    // Strip console.log/info/debug in production but keep console.error / .warn for diagnostics.
    removeConsole: { exclude: ['error', 'warn'] },
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  // Disable webpack's filesystem cache in dev. The project lives on OneDrive,
  // whose sync activity intermittently locks/relocates files in `.next/cache`,
  // which corrupts webpack's chunk map and causes random "Cannot find module
  // './XXX.js'" or 404'd static asset errors. Using memory-only cache avoids
  // this entirely. Trade-off: cold dev starts are slightly slower (no warm
  // cache between sessions), but hot reloads during a session stay fast and
  // — most importantly — never desync.
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
      config.watchOptions = {
        ...(config.watchOptions || {}),
        // Poll the filesystem instead of relying on inotify-style events.
        // OneDrive's syncer can swallow change events; polling is reliable.
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ["**/node_modules", "**/.next", "**/.git"],
      };
    }
    return config;
  },
};

export default nextConfig;