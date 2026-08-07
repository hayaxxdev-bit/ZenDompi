/**
 * Tipe dompet/akun keuangan
 */
export const WalletType = {
  BANK: "bank",
  E_WALLET: "e-wallet",
  CASH: "cash",
} as const;

export type WalletType = (typeof WalletType)[keyof typeof WalletType];

export const WalletTypeValues = Object.values(WalletType);
/**
 * Display labels
 */
export const WalletTypeLabel: Record<WalletType, string> = {
  bank: "Bank",
  "e-wallet": "E-Wallet",
  cash: "Tunai",
};

/**
 * Ikon untuk setiap tipe wallet
 */
export const WalletTypeIcon: Record<WalletType, string> = {
  bank: "🏦",
  "e-wallet": "📱",
  cash: "💵",
};

/**
 * Deskripsi tipe wallet
 */
export const WalletTypeDescription: Record<WalletType, string> = {
  bank: "Rekening bank seperti BCA, Mandiri, BNI",
  "e-wallet": "Dompet digital seperti GoPay, OVO, DANA",
  cash: "Uang tunai fisik",
};