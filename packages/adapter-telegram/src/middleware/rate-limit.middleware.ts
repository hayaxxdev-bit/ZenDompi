import type { BotContext } from "../bot";

const requestCounts = new Map<string, { count: number; resetTime: number }>();
const MAX_REQUESTS = 20; // Per menit
const WINDOW_MS = 60_000;

/**
 * Rate limiting sederhana per user
 */
export function rateLimitMiddleware(ctx: BotContext, next: () => Promise<void>) {
  const userId = ctx.from?.id?.toString();
  if (!userId) return next();

  const now = Date.now();
  const entry = requestCounts.get(userId);

  if (!entry || now > entry.resetTime) {
    requestCounts.set(userId, { count: 1, resetTime: now + WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_REQUESTS) {
    return ctx.reply("⚠️ Terlalu banyak permintaan. Coba lagi nanti.");
  }

  entry.count++;
  return next();
}