import type { BotContext } from "../bot";
import { authService } from "@zendompi/core";
import { sendText } from "../sender";

/**
 * /start — Mulai bot
 */
export async function handleStart(ctx: BotContext) {
  const telegramId = ctx.from?.id?.toString();
  const name = ctx.from?.first_name || "User";

  if (!telegramId) {
    return ctx.reply("❌ Gagal membaca Telegram ID.");
  }

  // Cek apakah user sudah terdaftar
  let isNewUser = false;
  try {
    const user = await authService.login({
      telegramId,
      otp: "000000", // Auto-approve untuk /start
    });
    isNewUser = user.isNewUser;
  } catch {
    // Register silently
    const result = await authService.login({
      telegramId,
      otp: "000000",
    });
    isNewUser = result.isNewUser;
  }

  const welcomeMessage = isNewUser
    ? `🎉 <b>Selamat datang di ZenDompi, ${name}!</b>\n\n` +
      `Akun kamu sudah dibuat otomatis. 🏦\n\n` +
      `<b>Kamu bisa:</b>\n` +
      `• 💬 Chat untuk catat transaksi\n` +
      `• 📊 Dashboard di web\n\n` +
      `<b>Contoh chat:</b>\n` +
      `<code>Makan siang 25rb pake GoPay</code>\n` +
      `<code>Top up OVO 50rb dari BCA</code>\n` +
      `<code>Gaji 10jt masuk Mandiri</code>\n\n` +
      `Ketik /bantuan untuk bantuan lengkap.`
    : `👋 <b>Halo ${name}!</b>\n\n` +
      `Selamat datang kembali di ZenDompi Bot! 🏦\n\n` +
      `Ketik /bantuan untuk bantuan lengkap.`;

  await sendText({
    chatId: ctx.chat?.id?.toString() || "",
    text: welcomeMessage,
    parseMode: "HTML",
    keyboard: {
      rows: [
        [
          { text: "💰 Cek Saldo", callbackData: "check_balance" },
          { text: "📝 Transaksi", callbackData: "recent_transactions" },
        ],
      ],
    },
  });
}

/**
 * /help — Bantuan
 */
export async function handleHelp(ctx: BotContext) {
  await sendText({
    chatId: ctx.chat?.id?.toString() || "",
    text:
      `📚 <b>Bantuan ZenDompi Bot</b>\n\n` +
      `<b>Perintah:</b>\n` +
      `/start - Mulai bot\n` +
      `/id - Lihat Telegram ID\n` +
      `/saldo - Cek saldo\n` +
      `/transaksi - Transaksi terbaru\n` +
      `/bantuan - Bantuan ini\n\n` +
      `<b>Format chat:</b>\n` +
      `<code>Makan siang 25rb pake GoPay</code>\n` +
      `<code>Top up OVO 50rb dari BCA</code>\n` +
      `<code>Gaji 10jt masuk Mandiri</code>`,
    parseMode: "HTML",
  });
}

/**
 * /id — Tampilkan Telegram ID
 */
export async function handleId(ctx: BotContext) {
  const id = ctx.from?.id;
  await sendText({
    chatId: ctx.chat?.id?.toString() || "",
    text:
      `📋 <b>Info Akun Telegram</b>\n\n` +
      `👤 Nama: <b>${ctx.from?.first_name || "User"}</b>\n` +
      `🆔 Telegram ID: <code>${id}</code>\n\n` +
      `🔗 Gunakan ID ini untuk login di dashboard.`,
    parseMode: "HTML",
  });
}

/**
 * /saldo — Cek saldo (placeholder, nanti panggil Core)
 */
export async function handleBalance(ctx: BotContext) {
  const telegramId = ctx.from?.id?.toString();
  if (!telegramId) return;

  // TODO: Panggil walletService dari Core
  await sendText({
    chatId: ctx.chat?.id?.toString() || "",
    text: "💰 Fitur cek saldo akan segera tersedia!",
  });
}

/**
 * /transaksi — Transaksi terbaru (placeholder)
 */
export async function handleRecentTransactions(ctx: BotContext) {
  await sendText({
    chatId: ctx.chat?.id?.toString() || "",
    text: "📝 Fitur transaksi akan segera tersedia!",
  });
}

/**
 * /bantuan — Sama dengan /help
 */
export const handleBantuan = handleHelp;