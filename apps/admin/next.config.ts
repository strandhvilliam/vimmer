import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    dynamicIO: true,
    reactCompiler: true,
    ppr: true,
  },
};

export default nextConfig;
