/**
 * Shared constants untuk Webhook Bot
 */

// Wallet default yang dibuat untuk user baru
export const DEFAULT_WALLETS = [
  { name: "Cash", type: "cash", initialBalance: 0 },
  { name: "BCA Tahapan", type: "bank", initialBalance: 0 },
  { name: "Mandiri", type: "bank", initialBalance: 0 },
] as const;

// Kategori default
export const DEFAULT_CATEGORIES = [
  { name: "Makanan", type: "expense", icon: "🍔" },
  { name: "Transport", type: "expense", icon: "🚗" },
  { name: "Belanja", type: "expense", icon: "🛍️" },
  { name: "Hiburan", type: "expense", icon: "🎮" },
  { name: "Kesehatan", type: "expense", icon: "💊" },
  { name: "Pendidikan", type: "expense", icon: "📚" },
  { name: "Tagihan", type: "expense", icon: "🧾" },
  { name: "Top Up", type: "transfer", icon: "🔄" },
  { name: "Gaji", type: "income", icon: "💼" },
  { name: "Freelance", type: "income", icon: "💻" },
  { name: "Investasi", type: "income", icon: "📈" },
  { name: "Lainnya", type: "expense", icon: "📌" },
] as const;

// Recognized wallet aliases untuk AI extraction
export const WALLET_ALIASES: Record<string, string> = {
  bca: "BCA Tahapan",
  "bca tahapan": "BCA Tahapan",
  mandiri: "Mandiri",
  "bank mandiri": "Mandiri",
  gopay: "GoPay",
  "go-pay": "GoPay",
  ovo: "OVO",
  cash: "Cash",
  tunai: "Cash",
  dana: "DANA",
  shopeepay: "ShopeePay",
  "shopee pay": "ShopeePay",
  linkaja: "LinkAja",
  "link aja": "LinkAja",
};

// Regex patterns untuk ekstraksi cepat (fallback tanpa AI)
export const AMOUNT_PATTERNS = {
  // "50rb", "50 ribu", "50.000", "50000"
  withSuffix: /(\d+)\s*(rb|ribu|jt|juta|k)/i,
  plainNumber: /(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+)/,
};

export const SUFFIX_MULTIPLIERS: Record<string, number> = {
  rb: 1_000,
  ribu: 1_000,
  jt: 1_000_000,
  juta: 1_000_000,
  k: 1_000,
};