import { Bot } from "grammy";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  throw new Error("TELEGRAM_BOT_TOKEN tidak ditemukan di environment variable!");
}

export const bot = new Bot(token);

// Tambahkan semua command & listener di sini
bot.command("start", (ctx) => ctx.reply("Bot berjalan di Vercel Serverless!"));

bot.command("ping", (ctx) => ctx.reply("Pong!"));

// Contoh listener pesan biasa
bot.on("message:text", (ctx) => {
  console.log(`[Pesan Diterima]: ${ctx.message.text}`);
});