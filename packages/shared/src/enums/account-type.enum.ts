/**
 * Posisi entri jurnal dalam sistem Double-Entry Bookkeeping.
 * PERHATIAN: Debit/Credit BUKAN sekadar Masuk/Keluar.
 * Sifatnya tergantung pada Tipe Akun (Asset/Liability/Equity/dll).
 */
export const AccountType = {
  DEBIT: "debit",
  CREDIT: "credit",
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];

// Label ini biasanya hanya dilihat oleh Admin / Developer, 
// User biasa sebaiknya tidak melihat istilah Debit/Kredit karena membingungkan.
export const AccountTypeLabel: Record<AccountType, string> = {
  debit: "Debit",
  credit: "Kredit",
};