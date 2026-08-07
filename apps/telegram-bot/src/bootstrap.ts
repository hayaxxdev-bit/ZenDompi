import "dotenv/config";
import { createBot, BOT_COMMANDS } from "@zendompi/adapter-telegram/bot";
import {
  loggerMiddleware,
  rateLimitMiddleware,
} from "@zendompi/adapter-telegram/middleware";
import {
  handleStart,
  handleHelp,
  handleId,
  handleBalance,
  handleRecentTransactions,
  handleBantuan,
  handleMessage,
  handleCallback,
} from "@zendompi/adapter-telegram/handlers";
import { subscribeTransactionEvents } from "@zendompi/adapter-telegram/subscriber";
import { getUserByTelegramId, createUser } from "@zendompi/database";

export async function bootstrap() {
  const token = process.env.telegram_BOT_TOKEN;

  if (!token) {
    console.error("❌ telegram_BOT_TOKEN tidak ditemukan!");
    process.exit(1);
  }

  // 1. Buat bot
  const bot = createBot(token);

  // 2. Register middleware (urutan penting!)
  bot.use(loggerMiddleware);
  bot.use(rateLimitMiddleware);

  // 3. Auto-register middleware — sinkronisasi user
  bot.use(async (ctx, next) => {
    const telegramId = ctx.from?.id;
    const username = [ctx.from?.first_name, ctx.from?.last_name]
      .filter(Boolean)
      .join(" ") || "User";

    if (telegramId) {
      try {
        // Cek user exists, kalau tidak → buat
        let user = await getUserByTelegramId(telegramId.toString());

        if (!user) {
          user = await createUser({
            telegramId: telegramId.toString(),
            name: username,
          });
          console.log(`🆕 User baru terdaftar: ${user.name} (${user.id})`);
        }

        // Simpan userId di ctx untuk digunakan handler
        (ctx as any).zenUserId = user.id;
        (ctx as any).zenTelegramId = telegramId.toString();
      } catch (error) {
        console.error(`[Middleware] Gagal sinkronisasi user ${telegramId}:`, error);
      }
    }

    return next();
  });

  // 4. Register command handlers
  bot.command("start", handleStart);
  bot.command("help", handleHelp);
  bot.command("id", handleId);
  bot.command("saldo", handleBalance);
  bot.command("transaksi", handleRecentTransactions);
  bot.command("bantuan", handleBantuan);

  // 5. Register message handler
  bot.on("message:text", handleMessage);

  // 6. Register callback handler
  bot.on("callback_query:data", handleCallback);

  // 7. Set bot commands
  try {
    await bot.api.setMyCommands(BOT_COMMANDS);
    console.log("✅ Bot commands registered");
  } catch (error) {
    console.warn("⚠️ Gagal setMyCommands (abaikan jika koneksi lambat):", (error as Error).message);
  }

  // 8. Subscribe events
  subscribeTransactionEvents();

  console.log("✅ Telegram bot siap!");
  return bot;
}