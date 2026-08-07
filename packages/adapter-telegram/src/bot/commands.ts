import type { BotCommand } from "grammy/types";

/**
 * Daftar command yang tersedia di bot
 * Digunakan untuk setMyCommands() + ditampilkan di menu Telegram
 */
export const BOT_COMMANDS: BotCommand[] = [
  { command: "start", description: "Mulai bot & lihat info akun" },
  { command: "help", description: "Bantuan penggunaan bot" },
  { command: "id", description: "Lihat Telegram ID kamu" },
  { command: "login", description: "Login ke dashboard" },
  { command: "saldo", description: "Cek saldo semua wallet" },
  { command: "transaksi", description: "Lihat transaksi terbaru" },
  { command: "bantuan", description: "Panduan format chat" },
];