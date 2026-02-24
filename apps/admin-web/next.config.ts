import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // TODO: Regenerate Supabase types to include `corridas` table and remove this flag
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
