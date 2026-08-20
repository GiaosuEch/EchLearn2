import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output enables the slim Docker runtime stage and
  // Render/Railway deployments (~<100MB image, no node_modules).
  output: "standalone",
  poweredByHeader: false,
  // This repository has a separate root application lockfile. Pin Turbopack to
  // this service so tracing and standalone output do not infer the monorepo root.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
