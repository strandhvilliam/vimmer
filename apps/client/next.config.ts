import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    dynamicIO: true,
    reactCompiler: true,
  },
};

export default nextConfig;
