import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Keep builds scoped to this application when parent folders contain
    // unrelated package lockfiles.
    root: process.cwd(),
  },
};

export default nextConfig;
