import type { NextConfig } from "next";
import { withPostHogConfig } from "@posthog/nextjs-config";

const nextConfig: NextConfig = {
  experimental: {
    // dynamicIO: true,
    // reactCompiler: true,
    // ppr: true,
    // useCache: true,
  },
};

export default nextConfig;

// export default withPostHogConfig(nextConfig, {
//   personalApiKey: process.env.POSTHOG_API_KEY!, // Personal API Key
//   // envId: process.env.POSTHOG_ENV_ID, // Environment ID
//   envId: "73054",
//   host: process.env.NEXT_PUBLIC_POSTHOG_HOST, // (optional), defaults to https://us.posthog.com
//   sourcemaps: {
//     // (optional)
//     enabled: true, // (optional) Enable sourcemaps generation and upload, default to true on production builds
//     deleteAfterUpload: true, // (optional) Delete sourcemaps after upload, defaults to true
//   },
// });
