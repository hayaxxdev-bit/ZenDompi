import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Konfigurasi untuk serverless functions
  serverExternalPackages: ["@google/generative-ai"],
};

export default nextConfig;