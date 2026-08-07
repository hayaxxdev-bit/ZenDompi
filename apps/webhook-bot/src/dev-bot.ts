/**
 * Development Bot — Menggunakan Long Polling
 * 
 * Jalankan dengan:
 * pnpm --filter @zendompi/webhook-bot dev:bot
 */

import { config } from "dotenv";

// 1. Muat environment variables SEBELUM memanggil grammy
config({ path: ".env.local" }); // Prioritaskan .env.local
config(); // Fallback ke .env biasa jika ada

import { Bot } from "grammy";

const telegram_BOT_TOKEN = process.env.telegram_BOT_TOKEN;

if (!telegram_BOT_TOKEN) {
  console.error("❌ telegram_BOT_TOKEN tidak ditemukan!");
  console.error("Pastikan sudah di-set di apps/webhook-bot/.env.local");
  process.exit(1);
}

const bot = new Bot(telegram_BOT_TOKEN);

// ─── Command Handlers ──────────────────────────

bot.command("start", async (ctx) => {
  const name = ctx.from?.first_name || "User";
  const telegramId = ctx.from?.id;

  console.log(`📱 /start dari ${name} (ID: ${telegramId})`);

  await ctx.reply(
    `🎉 <b>Halo ${name}!</b>\n\n` +
    `Selamat datang di <b>ZenDompi Bot</b>! 🏦\n\n` +
    `Telegram ID kamu: <code>${telegramId}</code>\n\n` +
    `<b>Perintah:</b>\n` +
    `/id - Lihat Telegram ID\n` +
    `/login [kode] - Login dashboard\n` +
    `/bantuan - Bantuan\n\n` +
    `<b>Contoh catat transaksi:</b>\n` +
    `<code>Makan siang 25rb pake GoPay</code>\n` +
    `<code>Top up OVO 50rb dari BCA</code>`,
    { parse_mode: "HTML" }
  );
});

bot.command("id", async (ctx) => {
  const id = ctx.from?.id;
  const name = ctx.from?.first_name || "User";

  console.log(`📱 /id dari ${name} (ID: ${id})`);

  await ctx.reply(
    `📋 <b>Info Akun Telegram</b>\n\n` +
    `👤 Nama: <b>${name}</b>\n` +
    `🆔 Telegram ID: <code>${id}</code>\n\n` +
    `🔗 Gunakan ID ini untuk login di dashboard.`,
    { parse_mode: "HTML" }
  );
});

bot.command("login", async (ctx) => {
  const code = ctx.match?.trim();
  const telegramId = ctx.from?.id;

  if (!code) {
    await ctx.reply(
      "❌ Format: /login [kode]\n\n" +
      "Dapatkan kode dari halaman login ZenDompi."
    );
    return;
  }

  console.log(`📱 /login dari ID ${telegramId} dengan kode: ${code}`);

try {
    // UBAH URL INI: gunakan /api/auth/verify-login-code
    const response = await fetch(`http://localhost:3000/api/auth/verify-login-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        code: code, 
        telegramId: telegramId?.toString()
      })
    });

    if (response.ok) {
      await ctx.reply(
        `✅ <b>Login Berhasil!</b>\n\n` +
        `Web browser kamu sekarang akan otomatis masuk ke dashboard.`,
        { parse_mode: "HTML" }
      );
    } else {
      const data = await response.json();
      await ctx.reply(`❌ <b>Gagal:</b> ${data.error || "Kode tidak valid atau kadaluarsa."}`, { parse_mode: "HTML" });
    }
  } catch (error) {
    console.error("Gagal menghubungi server Next.js:", error);
    await ctx.reply("❌ Terjadi kesalahan. Pastikan server web Next.js sedang berjalan di port 3000.");
  }
});

bot.command("bantuan", async (ctx) => {
  await ctx.reply(
    `📚 <b>Bantuan ZenDompi Bot</b>\n\n` +
    `<b>Perintah tersedia:</b>\n` +
    `/start - Mulai bot & lihat info\n` +
    `/id - Lihat Telegram ID kamu\n` +
    `/login [kode] - Verifikasi kode login\n` +
    `/bantuan - Bantuan ini\n\n` +
    `<b>Contoh catat transaksi:</b>\n` +
    `• "Makan siang 25rb pake GoPay"\n` +
    `• "Top up OVO 50rb dari BCA"\n` +
    `• "Gaji 10jt masuk Mandiri"\n\n` +
    `Bot akan otomatis memahami dan mencatat! 🤖`,
    { parse_mode: "HTML" }
  );
});

// Handle text messages (untuk catat transaksi nanti)
bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;

  // Skip commands
  if (text.startsWith("/")) return;

  const name = ctx.from?.first_name || "User";
  console.log(`💬 Pesan dari ${name}: ${text}`);

  // Untuk sekarang, balas dengan konfirmasi
  await ctx.reply(
    `📝 <b>Pesan diterima!</b>\n\n` +
    `<i>${text}</i>\n\n` +
    `Fitur pencatatan transaksi otomatis akan segera tersedia! 🚧`,
    { parse_mode: "HTML" }
  );
});

// ─── Start Bot ──────────────────────────────────

async function startBot() {
  console.log("🤖 Membersihkan pengaturan webhook lama...");
  
  try {
    // Memaksa Telegram menghapus webhook jika ada, dan membuang pesan yang nyangkut
    await bot.api.deleteWebhook({ drop_pending_updates: true });
    console.log("✅ Webhook bersih!");
  } catch (err) {
    console.log("⚠️ Gagal membersihkan webhook (mungkin memang tidak ada).");
  }

  console.log("🤖 Starting ZenDompi Bot (Development Mode)...");
  console.log(`Token: ${telegram_BOT_TOKEN!.slice(0, 10)}...`);

  bot.start({
    onStart: (botInfo) => {
      console.log(`✅ Bot @${botInfo.username} siap!`);
      console.log(`📱 Telegram ID bot: ${botInfo.id}`);
      console.log(`👤 Nama bot: ${botInfo.first_name}`);
      console.log("\n⌨️  Tekan Ctrl+C untuk berhenti\n");
    },
  });
}

// Jalankan fungsi
startBot();