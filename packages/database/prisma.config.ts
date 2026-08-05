import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  // earlyAccess: true,
  schema: "./prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
    // directUrl: process.env.DATABASE_URL_UNPOOLED! || process.env.DATABASE_URL!,
  },
});