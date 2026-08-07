import type { InlineKeyboard } from "../types";

/**
 * Helper: bikin inline keyboard
 */
export function createKeyboard(
  ...rows: { text: string; callbackData: string }[][]
): InlineKeyboard {
  return {
    rows: rows.map((row) =>
      row.map((btn) => ({
        text: btn.text,
        callbackData: btn.callbackData,
      }))
    ),
  };
}

/**
 * Quick reply keyboard templates
 */
export const Keyboards = {
  mainMenu: () =>
    createKeyboard(
      [
        { text: "💰 Cek Saldo", callbackData: "check_balance" },
        { text: "📝 Transaksi", callbackData: "recent_transactions" },
      ],
      [
        { text: "💳 Dompet Saya", callbackData: "my_wallets" },
        { text: "❓ Bantuan", callbackData: "help" },
      ]
    ),

  confirm: (yesData = "confirm_yes", noData = "confirm_no") =>
    createKeyboard([
      { text: "✅ Ya", callbackData: yesData },
      { text: "❌ Tidak", callbackData: noData },
    ]),
};