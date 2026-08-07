import { Bot, type Context, type SessionFlavor } from "grammy";

// Session type (bisa di-extend nanti)
export type BotSession = {
  userId?: string;
  step?: string;
};

export type BotContext = Context & SessionFlavor<BotSession>;

let botInstance: Bot<BotContext> | null = null;

/**
 * Singleton Grammy bot
 */
export function createBot(token: string): Bot<BotContext> {
  if (botInstance) return botInstance;

  botInstance = new Bot<BotContext>(token);

  return botInstance;
}

export function getBot(): Bot<BotContext> {
  if (!botInstance) {
    throw new Error(
      "Bot belum diinisialisasi. Panggil createBot() terlebih dahulu."
    );
  }
  return botInstance;
}