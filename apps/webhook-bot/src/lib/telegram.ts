import { Bot } from "grammy";

export const telegramBot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

/**
 * Kirim pesan balasan ke user Telegram
 */
export async function sendTelegramMessage(
  chatId: number,
  text: string
): Promise<void> {
  try {
    await telegramBot.api.sendMessage(chatId, text, {
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
  }
}