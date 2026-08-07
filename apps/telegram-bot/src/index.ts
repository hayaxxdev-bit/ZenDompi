import "dotenv/config";
import { Bot } from "grammy"; // Atau 'telegraf' / 'node-telegram-bot-api' sesuaikan dengan library Anda
import { webhookCallback } from "grammy";

export const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN || "");

// Inisialisasi EventBus & Handler Bot Anda di sini
bot.command("start", (ctx) => ctx.reply("Bot Aktif!"));

// Mode 1: LOKAL DEVELOPMENT (Long Polling)
if (process.env.NODE_ENV !== "production") {
  bot.start({
    onStart: () => {
      console.log("[Subscriber] TransactionCreated → Telegram notification");
      console.log("✅ Telegram bot siap (Mode Dev / Long Polling)!");
    },
  });
}

// Mode 2: VERCEL PRODUCTION (Webhook Handler)
export default webhookCallback(bot, "std/http");