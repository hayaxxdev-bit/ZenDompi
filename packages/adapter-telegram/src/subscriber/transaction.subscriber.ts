import { eventBus, TransactionCreatedEvent } from "@zendompi/events";
import { sendText } from "../sender";
import { formatRupiah } from "@zendompi/shared";

/**
 * Subscribe ke TransactionCreated event
 * Kirim notifikasi ke user via Telegram
 */
export function subscribeTransactionEvents() {
  eventBus.subscribe<TransactionCreatedEvent>(
    "TransactionCreated",
    async (event) => {
      const { userId, amount, type, description } = event.payload;

      const emoji = type === "INCOME" ? "📥" : type === "EXPENSE" ? "📤" : "🔄";
      const sign = type === "INCOME" ? "+" : type === "EXPENSE" ? "-" : "↔";

      try {
        // Cari chatId dari userId (telegramId)
        // TODO: Get user telegramId from database
        const chatId = userId; // Untuk sekarang, userId = telegramId

        await sendText({
          chatId,
          text:
            `✅ <b>Transaksi Berhasil!</b>\n\n` +
            `${emoji} ${description || "Transaksi"}\n` +
            `💵 ${sign} ${formatRupiah(amount)}`,
          parseMode: "HTML",
        });
      } catch (error) {
        console.error("[Subscriber] Failed to send Telegram notification:", error);
      }
    }
  );

  console.log("[Subscriber] TransactionCreated → Telegram notification");
}