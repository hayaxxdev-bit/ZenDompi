/**
 * Batasan nominal transaksi (Absolute value)
 * Catatan: Karena menggunakan IDR, 999 Miliar adalah batas yang wajar untuk personal finance.
 */
export const TRANSACTION_AMOUNT_MIN = 1; // Rp 1
export const TRANSACTION_AMOUNT_MAX = 999_999_999_999; // Rp 999.999.999.999

/**
 * Panjang deskripsi transaksi
 */
export const TRANSACTION_DESCRIPTION_MIN_LENGTH = 0; // 0 jika opsional, ubah ke 1 jika wajib
export const TRANSACTION_DESCRIPTION_MAX_LENGTH = 500;

/**
 * Default pagination
 */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * 1. Definisi nilai konstan (Digunakan oleh Backend/Validasi API)
 */
export const TransactionSort = {
  NEWEST: "newest",
  OLDEST: "oldest",
  LARGEST: "largest",
  SMALLEST: "smallest",
} as const;

export type TransactionSort = (typeof TransactionSort)[keyof typeof TransactionSort];

/**
 * 2. Opsi untuk UI/Frontend (Digunakan untuk Dropdown/Select)
 */
export const TRANSACTION_SORT_OPTIONS: readonly { value: TransactionSort; label: string }[] = [
  { value: TransactionSort.NEWEST, label: "Terbaru" },
  { value: TransactionSort.OLDEST, label: "Terlama" },
  { value: TransactionSort.LARGEST, label: "Nominal Terbesar" },
  { value: TransactionSort.SMALLEST, label: "Nominal Terkecil" },
];