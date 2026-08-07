import { getBot } from "../bot";
import type { OutgoingMessage } from "../types";

/**
 * Kirim pesan teks ke user Telegram
 */
export async function sendText(message: OutgoingMessage): Promise<void> {
  const bot = getBot();

  try {
    await bot.api.sendMessage(message.chatId, message.text, {
      parse_mode: message.parseMode || "HTML",
      ...(message.keyboard && {
        reply_markup: {
          inline_keyboard: message.keyboard.rows.map((row) =>
            row.map((btn) => {
              if (btn.url) {
                return { text: btn.text, url: btn.url };
              }
              return {
                text: btn.text,
                callback_data: btn.callbackData ?? "",
              };
            })
          ),
        },
      }),
    });
  } catch (error: any) {
    // User mungkin blokir bot
    if (error?.error_code === 403) {
      console.warn(`[Sender] User ${message.chatId} blocked the bot`);
      return;
    }
    console.error("[Sender] Failed to send message:", error);
  }
}