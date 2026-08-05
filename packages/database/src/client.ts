import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;

// Buat pool dan adapter hanya jika DATABASE_URL tersedia (mencegah throw error saat build phase)
const pool = connectionString ? new pg.Pool({ connectionString }) : undefined;
const adapter = pool ? new PrismaPg(pool) : undefined;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    adapter
      ? { adapter }
      : undefined
  );

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;