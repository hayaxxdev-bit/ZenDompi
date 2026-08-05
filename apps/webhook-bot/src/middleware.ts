import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware untuk Webhook Bot
 * 
 * Fungsi:
 * - Logging incoming requests
 * - Validasi method (POST required untuk webhook)
 * - Rate limiting sederhana (per IP)
 * - CORS handling untuk development
 */

// Simple in-memory rate limiter
// Untuk production, gunakan Upstash Redis
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // Max 30 requests per menit
const WINDOW_MS = 60 * 1000; // 1 menit

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;
  const ip = req.headers.get("x-forwarded-for") || "unknown";

  // ─── Logging ──────────────────────────────────
  console.log(`[${new Date().toISOString()}] ${method} ${pathname} - ${ip}`);

  // ─── Rate Limiting untuk API routes ───────────
  if (pathname.startsWith("/api/")) {
    if (!checkRateLimit(ip)) {
      console.warn(`⚠️ Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }
  }

  // ─── Method Validation untuk Webhook ──────────
  // Telegram & WhatsApp webhook hanya menerima POST
  if (
    pathname.startsWith("/api/webhook/") &&
    method !== "POST" &&
    method !== "GET" // GET diperlukan untuk verifikasi WhatsApp
  ) {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }

  // ─── CORS Headers (untuk development) ─────────
  const response = NextResponse.next();

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  // Handle OPTIONS preflight
  if (method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: response.headers,
    });
  }

  return response;
}

// ─── Konfigurasi Path ──────────────────────────
// Middleware hanya berjalan untuk path API
export const config = {
  matcher: [
    "/api/:path*",
  ],
};