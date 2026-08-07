import { Bot } from "grammy";

// Singleton bot instance
let botInstance: Bot | null = null;

export function getBot(): Bot {
  if (!botInstance) {
    const token = process.env.telegram_BOT_TOKEN;
    if (!token) {
      throw new Error("telegram_BOT_TOKEN is not set");
    }
    botInstance = new Bot(token);
  }
  return botInstance;
}

/**
 * Kirim pesan ke user Telegram via chat ID
 */
export async function sendTelegramMessage(
  chatId: number,
  text: string
): Promise<boolean> {
  try {
    const bot = getBot();
    await bot.api.sendMessage(chatId, text, {
      parse_mode: "HTML",
    });
    return true;
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
    return false;
  }
}

/**
 * Verifikasi apakah user sudah memulai bot
 * Returns chat ID jika valid, null jika belum
 */
export async function verifyTelegramUser(
  telegramId: number
): Promise<number | null> {
  try {
    const bot = getBot();
    // Coba kirim pesan test (akan gagal jika user belum mulai bot)
    const chat = await bot.api.getChat(telegramId);
    return chat.id;
  } catch {
    return null;
  }
}

/**
 * Format pesan OTP untuk Telegram
 */
export function formatOTPMessage(
  otp: string,
  username: string
): string {
  return `
🔐 <b>Kode Verifikasi ZenDompi</b>

Halo ${username}! Kode verifikasi kamu:

<pre>${otp}</pre>

⏰ Berlaku selama <b>5 menit</b>
⚠️ Jangan berikan kode ini kepada siapapun!

_Kode ini digunakan untuk login ke dashboard ZenDompi._
  `.trim();
}

/**
 * Format pesan selamat datang
 */
export function formatWelcomeMessage(name: string): string {
  return `
🎉 <b>Selamat datang di ZenDompi, ${name}!</b>

🏦 Akun kamu sudah terhubung dengan Telegram.

Fitur yang bisa kamu gunakan:
• 💬 Chat untuk catat transaksi
• 📊 Dashboard keuangan
• 💰 Multi-wallet management

<b>Contoh chat:</b>
• "Makan siang 25rb pake GoPay"
• "Top up OVO 50rb dari BCA"
• "Gaji 10jt masuk Mandiri"

Selamat mencatat! 🚀
  `.trim();
}