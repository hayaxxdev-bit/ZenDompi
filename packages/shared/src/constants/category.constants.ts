import { TransactionType } from "../enums";

// 1. Buat tipe dasar agar struktur selalu konsisten
export interface DefaultCategory {
  id: string; // Pengenal statis untuk database
  name: string;
  icon: string;
  type: TransactionType;
}

/**
 * Kategori default untuk expense
 */
export const DEFAULT_EXPENSE_CATEGORIES: readonly DefaultCategory[] = [
  { id: "exp-food", name: "Makanan", icon: "🍔", type: TransactionType.EXPENSE },
  { id: "exp-transport", name: "Transportasi", icon: "🚗", type: TransactionType.EXPENSE },
  { id: "exp-shopping", name: "Belanja", icon: "🛍️", type: TransactionType.EXPENSE },
  { id: "exp-bills", name: "Tagihan", icon: "🧾", type: TransactionType.EXPENSE },
  { id: "exp-debt", name: "Cicilan", icon: "💳", type: TransactionType.EXPENSE }, // Tambahan
  { id: "exp-health", name: "Kesehatan", icon: "💊", type: TransactionType.EXPENSE },
  { id: "exp-education", name: "Pendidikan", icon: "📚", type: TransactionType.EXPENSE },
  { id: "exp-charity", name: "Donasi & Sosial", icon: "🤲", type: TransactionType.EXPENSE }, // Tambahan
  { id: "exp-admin", name: "Biaya Admin", icon: "🏦", type: TransactionType.EXPENSE }, // Tambahan
  { id: "exp-gift", name: "Hadiah", icon: "🎁", type: TransactionType.EXPENSE },
  { id: "exp-entertainment", name: "Hiburan", icon: "🎮", type: TransactionType.EXPENSE },
  { id: "exp-other", name: "Lainnya", icon: "📌", type: TransactionType.EXPENSE },
];

/**
 * Kategori default untuk income
 */
export const DEFAULT_INCOME_CATEGORIES: readonly DefaultCategory[] = [
  { id: "inc-salary", name: "Gaji", icon: "💼", type: TransactionType.INCOME },
  { id: "inc-freelance", name: "Freelance", icon: "💻", type: TransactionType.INCOME },
  { id: "inc-investment", name: "Investasi", icon: "📈", type: TransactionType.INCOME },
  { id: "inc-bonus", name: "Bonus", icon: "🎉", type: TransactionType.INCOME },
  { id: "inc-gift", name: "Pemberian", icon: "🧧", type: TransactionType.INCOME }, // Tambahan
  { id: "inc-other", name: "Lainnya", icon: "📌", type: TransactionType.INCOME },
];

/**
 * Kategori default untuk transfer
 */
export const DEFAULT_TRANSFER_CATEGORIES: readonly DefaultCategory[] = [
  { id: "trf-topup", name: "Top Up", icon: "🔄", type: TransactionType.TRANSFER },
  { id: "trf-send", name: "Kirim Uang", icon: "💸", type: TransactionType.TRANSFER },
  { id: "trf-other", name: "Lainnya", icon: "📌", type: TransactionType.TRANSFER },
];

/**
 * Semua kategori default digabung
 */
export const ALL_DEFAULT_CATEGORIES: readonly DefaultCategory[] = [
  ...DEFAULT_EXPENSE_CATEGORIES,
  ...DEFAULT_INCOME_CATEGORIES,
  ...DEFAULT_TRANSFER_CATEGORIES,
];

/**
 * Validasi panjang nama kategori untuk form/database
 */
export const CATEGORY_NAME_MIN_LENGTH = 1;
export const CATEGORY_NAME_MAX_LENGTH = 30;