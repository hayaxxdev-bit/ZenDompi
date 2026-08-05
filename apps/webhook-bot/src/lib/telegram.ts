import { Bot } from "grammy";

export const telegramBot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

// Handle /start
telegramBot.command("start", async (ctx) => {
  const name = ctx.from?.first_name || "User";
  await ctx.reply(
    `🎉 <b>Halo ${name}!</b>\n\n` +
    `Selamat datang di <b>ZenDompi Bot</b>! 🏦\n\n` +
    `Gunakan /id untuk lihat Telegram ID kamu.\n` +
    `Gunakan /bantuan untuk bantuan lengkap.\n\n` +
    `<b>Contoh catat transaksi:</b>\n` +
    `<code>Makan siang 25rb pake GoPay</code>`,
    { parse_mode: "HTML" }
  );
});

// Handle /id
telegramBot.command("id", async (ctx) => {
  const id = ctx.from?.id;
  await ctx.reply(
    `🆔 Telegram ID kamu: <code>${id}</code>\n\nGunakan ID ini untuk login di dashboard ZenDompi.`,
    { parse_mode: "HTML" }
  );
});

// Handle /login <code>
telegramBot.command("login", async (ctx) => {
  const code = ctx.match?.trim();
  const telegramId = ctx.from?.id;

  if (!code) {
    await ctx.reply("❌ Gunakan format: /login [kode]\nContoh: /login 123456");
    return;
  }

  if (!telegramId) {
    await ctx.reply("❌ Gagal mendapatkan Telegram ID kamu.");
    return;
  }

  try {
    // Panggil API internal untuk verifikasi
    const response = await fetch(
      `${process.env.VERCEL_URL || "http://localhost:3001"}/api/auth/verify-login-code`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          telegramId: telegramId.toString(),
        }),
      }
    );

    if (response.ok) {
      await ctx.reply("✅ Login berhasil! Dashboard kamu akan terbuka otomatis.");
    } else {
      await ctx.reply("❌ Kode login tidak valid atau sudah kadaluarsa.");
    }
  } catch (error) {
    console.error("Login verification error:", error);
    await ctx.reply("❌ Terjadi kesalahan. Coba lagi nanti.");
  }
});

// Handle /bantuan
telegramBot.command("bantuan", async (ctx) => {
  await ctx.reply(
    `📚 <b>Bantuan ZenDompi Bot</b>\n\n` +
    `<b>Perintah:</b>\n` +
    `/start - Mulai\n/id - Telegram ID\n/login - Kode login\n/bantuan - Bantuan\n\n` +
    `<b>Catat transaksi:</b>\n` +
    `"Makan siang 25rb pake GoPay"\n` +
    `"Top up OVO 50rb dari BCA"`,
    { parse_mode: "HTML" }
  );
});

export async function sendTelegramMessage(chatId: number, text: string): Promise<void> {
  try {
    await telegramBot.api.sendMessage(chatId, text, { parse_mode: "HTML" });
  } catch (error) {
    console.error("Send Telegram error:", error);
  }
}