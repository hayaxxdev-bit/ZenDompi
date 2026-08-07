import type { BotContext } from "../bot";
import { authService } from "@zendompi/core";

/**
 * Middleware: pastikan user terdaftar
 * Jika belum, arahkan ke /start
 */
export function authMiddleware(ctx: BotContext, next: () => Promise<void>) {
  const telegramId = ctx.from?.id?.toString();

  if (!telegramId) {
    return ctx.reply("❌ Tidak dapat membaca Telegram ID kamu.");
  }

  // Simpan telegramId di session
  if (!ctx.session) {
    (ctx as any).session = {};
  }
  ctx.session.userId = telegramId;

  return next();
}