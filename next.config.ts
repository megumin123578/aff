import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["neroviax.com", "*.neroviax.com"],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
