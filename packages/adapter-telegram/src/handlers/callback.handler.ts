import type { BotContext } from "../bot";
import { sendText } from "../sender";
import { walletService, dashboardService, transactionService } from "@zendompi/core";
import { formatRupiah } from "@zendompi/shared";

/**
 * Handler untuk callback query (inline keyboard button)
 */
export async function handleCallback(ctx: BotContext) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const chatId = ctx.chat?.id?.toString() || "";
  const telegramId = ctx.from?.id?.toString();

  // Always answer callback query
  await ctx.answerCallbackQuery();

  switch (data) {
    case "check_balance": {
      if (!telegramId) break;

      // Cari user by telegramId, lalu ambil wallet
      // TODO: Get user by telegramId dari Core
      const wallets = await walletService.list(telegramId);

      const walletList = wallets
        .map((w) => `• <b>${w.name}</b>: ${formatRupiah(w.balance)}`)
        .join("\n");

      await sendText({
        chatId,
        text: `💰 <b>Saldo Kamu</b>\n\n${walletList || "Belum ada dompet."}`,
        parseMode: "HTML",
      });
      break;
    }

    case "recent_transactions": {
      if (!telegramId) break;

      const txs = await transactionService.list({
        userId: telegramId,
        limit: 5,
      });

      const txList = txs.data
        .map(
          (tx) =>
            `• ${tx.type === "INCOME" ? "📥" : "📤"} ${formatRupiah(tx.amount)} — ${tx.description || "Tanpa deskripsi"}`
        )
        .join("\n");

      await sendText({
        chatId,
        text: `📝 <b>Transaksi Terbaru</b>\n\n${txList || "Belum ada transaksi."}`,
        parseMode: "HTML",
      });
      break;
    }

    case "help": {
      await sendText({
        chatId,
        text:
          `❓ <b>Bantuan</b>\n\n` +
          `Ketik pesan seperti:\n` +
          `<code>Makan siang 25rb pake GoPay</code>`,
        parseMode: "HTML",
      });
      break;
    }

    default:
      await sendText({
        chatId,
        text: `❓ Aksi tidak dikenali: ${data}`,
      });
  }
}