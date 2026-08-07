import { WalletType } from "../enums";

/**
 * Dompet default yang dibuat saat user pertama kali daftar
 */
export const DEFAULT_WALLETS = [
  {
    name: "Cash",
    type: WalletType.CASH,
    initialBalance: 0,
  },
] as const;

/**
 * Daftar nama wallet umum di Indonesia
 * Diperbarui dengan WalletType untuk keamanan tipe dan tambahan Bank Digital
 */
export const COMMON_WALLET_NAMES: Record<string, { type: WalletType; alias: string[] }> = {
  // --- Bank Konvensional ---
  "BCA": {
    type: WalletType.BANK,
    alias: ["bca", "tahapan", "bca tahapan", "klikbca", "mybca"],
  },
  "Mandiri": {
    type: WalletType.BANK,
    alias: ["mandiri", "bank mandiri", "livin"],
  },
  "BNI": {
    type: WalletType.BANK,
    alias: ["bni", "bank bni"],
  },
  "BRI": {
    type: WalletType.BANK,
    alias: ["bri", "bank bri", "brimo"],
  },
  "BSI": {
    type: WalletType.BANK,
    alias: ["bsi", "bank syariah indonesia"],
  },

  // --- Bank Digital ---
  "Bank Jago": {
    type: WalletType.BANK,
    alias: ["jago", "bank jago", "kantong jago"],
  },
  "SeaBank": {
    type: WalletType.BANK,
    alias: ["seabank", "sea bank"],
  },
  "Blu by BCA": {
    type: WalletType.BANK,
    alias: ["blu", "blu bca"],
  },

  // --- E-Wallet ---
  "GoPay": {
    type: WalletType.E_WALLET,
    alias: ["gopay", "go-pay", "go pay", "gopay later"],
  },
  "OVO": {
    type: WalletType.E_WALLET,
    alias: ["ovo", "ovo premier"],
  },
  "DANA": {
    type: WalletType.E_WALLET,
    alias: ["dana", "dompet dana"],
  },
  "ShopeePay": {
    type: WalletType.E_WALLET,
    alias: ["shopeepay", "shopee pay", "spay"],
  },
  "LinkAja": {
    type: WalletType.E_WALLET,
    alias: ["linkaja", "link aja"],
  },

  // --- Tunai ---
  "Cash": {
    type: WalletType.CASH,
    alias: ["cash", "tunai", "uang tunai", "dompet fisik"],
  },
} as const;

/**
 * Maksimum jumlah wallet per user
 */
export const MAX_WALLETS_PER_USER = 20;

/**
 * Panjang nama wallet
 */
export const WALLET_NAME_MIN_LENGTH = 2;
export const WALLET_NAME_MAX_LENGTH = 50;