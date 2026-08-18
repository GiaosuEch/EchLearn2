import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output enables the slim Docker runtime stage and
  // Render/Railway deployments (~<100MB image, no node_modules).
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
