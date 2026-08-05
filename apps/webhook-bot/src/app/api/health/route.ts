import { NextResponse } from "next/server";
import { prisma } from "@zendompi/database";

/**
 * GET /api/health
 * 
 * Health check endpoint untuk monitoring.
 * Mengecek koneksi database dan status service.
 */
export async function GET() {
  const checks: Record<string, { status: "ok" | "error"; message?: string }> = {
    server: { status: "ok" },
    database: { status: "ok" },
    gemini: { status: "ok" },
    qstash: { status: "ok" },
  };

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    checks.database = {
      status: "error",
      message: "Database connection failed",
    };
  }

  // Check Gemini API key
  if (!process.env.GEMINI_API_KEY) {
    checks.gemini = {
      status: "error",
      message: "GEMINI_API_KEY not configured",
    };
  }

  // Check QStash
  if (!process.env.QSTASH_TOKEN || !process.env.QSTASH_URL) {
    checks.qstash = {
      status: "error",
      message: "QStash not configured",
    };
  }

  const allOk = Object.values(checks).every((c) => c.status === "ok");
  const statusCode = allOk ? 200 : 503;

  return NextResponse.json(
    {
      service: "ZenDompi Webhook Bot",
      timestamp: new Date().toISOString(),
      status: allOk ? "healthy" : "degraded",
      checks,
    },
    { status: statusCode }
  );
}