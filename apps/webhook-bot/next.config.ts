import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Konfigurasi untuk serverless functions
  serverExternalPackages: [
    "@google/generative-ai",
    "@prisma/client",
    "pg",
    "pg-native",
  ],
};

export default nextConfig;
