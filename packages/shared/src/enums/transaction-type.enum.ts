/**
 * Tipe transaksi keuangan
 */
export const TransactionType = {
  INCOME: "income",
  EXPENSE: "expense",
  TRANSFER: "transfer",
  ADJUSTMENT: "adjustment", 
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

/**
 * Helper array untuk kemudahan looping UI (Dropdown/Select Options)
 */
export const TransactionTypeValues = Object.values(TransactionType);

/**
 * Display labels untuk setiap tipe
 */
export const TransactionTypeLabel: Record<TransactionType, string> = {
  income: "Pemasukan",
  expense: "Pengeluaran",
  transfer: "Transfer",
  adjustment: "Penyesuaian Saldo",
};

/**
 * Ikon untuk setiap tipe transaksi
 */
export const TransactionTypeIcon: Record<TransactionType, string> = {
  income: "📥",
  expense: "📤",
  transfer: "🔄",
  adjustment: "⚖️",
};

/**
 * Opsional: Warna untuk setiap tipe agar UI konsisten (Tailwind classes atau HEX)
 */
export const TransactionTypeColor: Record<TransactionType, string> = {
  income: "text-green-500", // atau "#22c55e"
  expense: "text-red-500",  // atau "#ef4444"
  transfer: "text-blue-500", // atau "#3b82f6"
  adjustment: "text-gray-500", // atau "#6b7280"
};