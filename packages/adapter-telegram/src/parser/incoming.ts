import type { BotContext } from "../bot";
import type { IncomingMessage } from "../types";

/**
 * Normalisasi pesan Telegram → IncomingMessage
 * 
 * Ini adalah jembatan antara format spesifik Telegram
 * dengan format universal yang dipakai oleh Core.
 */
export function parseIncomingMessage(ctx: BotContext): IncomingMessage {
  const from = ctx.from;
  const message = ctx.message;

  return {
    platform: "telegram",
    userId: from?.id?.toString() || "unknown",
    chatId: ctx.chat?.id?.toString() || "unknown",
    username: [from?.first_name, from?.last_name].filter(Boolean).join(" ") || "User",
    text: message?.text || "",
    timestamp: new Date(message?.date ? message.date * 1000 : Date.now()),
    content: ctx, // Simpan context asli untuk fallback
  };
}