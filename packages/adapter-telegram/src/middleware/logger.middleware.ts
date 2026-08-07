    import type { BotContext } from "../bot";

/**
 * Log setiap update yang masuk
 */
export function loggerMiddleware(ctx: BotContext, next: () => Promise<void>) {
  const from = ctx.from;
  const text = ctx.message?.text || ctx.callbackQuery?.data || "[non-text]";
  const userId = from?.id || "unknown";
  const username = from?.first_name || "unknown";

  console.log(`📱 [${new Date().toISOString()}] ${username} (${userId}): ${text}`);

  return next();
}