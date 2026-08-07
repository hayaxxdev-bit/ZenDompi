import { COMMON_WALLET_NAMES } from "@zendompi/shared";

/**
 * Normalisasi nominal uang dari teks
 * 
 * "50rb" → 50000
 * "50.000" → 50000
 * "1.5jt" → 1500000
 * "2 juta" → 2000000
 */
export function normalizeAmount(text: string): number | null {
  // Pola: "50rb", "50 ribu", "50k"
  const suffixMatch = text.match(/(\d+[.,]?\d*)\s*(rb|ribu|jt|juta|k|m|miliar)\b/i);
  if (suffixMatch) {
    const numStr = suffixMatch[1]!.replace(/\./g, "").replace(",", ".");
    const num = parseFloat(numStr);
    const suffix = suffixMatch[2]!.toLowerCase();

    const multipliers: Record<string, number> = {
      rb: 1_000, ribu: 1_000, k: 1_000,
      jt: 1_000_000, juta: 1_000_000, m: 1_000_000,
      miliar: 1_000_000_000,
    };

    return Math.round(num * (multipliers[suffix] || 1));
  }

  // Pola: "50000", "50.000", "50,000"
  const numberMatch = text.match(/\b(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{1,2})?|\d{4,})\b/);
  if (numberMatch) {
    // Hapus titik koma
    let numStr = numberMatch[1]!;
    // Jika format Indonesia: 50.000 (titik = pemisah ribuan)
    if (/^\d{1,3}(\.\d{3})+$/.test(numStr)) {
      numStr = numStr.replace(/\./g, "");
    }
    return parseInt(numStr, 10);
  }

  return null;
}

/**
 * Normalisasi nama wallet
 * 
 * "bca" → "BCA Tahapan"
 * "gopay" → "GoPay"
 */
export function normalizeWallet(text: string): string | null {
  const lower = text.toLowerCase().trim();

  for (const [canonicalName, { alias }] of Object.entries(COMMON_WALLET_NAMES)) {
    if (alias.some((a) => lower.includes(a))) {
      return canonicalName;
    }
  }

  // Exact match
  for (const canonicalName of Object.keys(COMMON_WALLET_NAMES)) {
    if (lower.includes(canonicalName.toLowerCase())) {
      return canonicalName;
    }
  }

  return null;
}

/**
 * Detect wallet yang disebut dalam kalimat
 * Returns { fromWallet, toWallet }
 */
export function detectWallets(text: string): {
  fromWallet: string | null;
  toWallet: string | null;
} {
  const lower = text.toLowerCase();
  let fromWallet: string | null = null;
  let toWallet: string | null = null;

  // Pola: "pake X", "dari X", "via X" → fromWallet
  const fromPatterns = [
    /\b(?:pake|pakai|dari|via|pake)\s+(\w[\w\s]*?)(?:\s|$)/i,
  ];

  for (const pattern of fromPatterns) {
    const match = text.match(pattern);
    if (match) {
      const walletName = normalizeWallet(match[1]!);
      if (walletName) fromWallet = walletName;
    }
  }

  // Pola: "ke X", "topup X", "isi X" → toWallet
  const toPatterns = [
    /\b(?:ke|topup|top up|isi|isi saldo)\s+(\w[\w\s]*?)(?:\s|$)/i,
  ];

  for (const pattern of toPatterns) {
    const match = text.match(pattern);
    if (match) {
      const walletName = normalizeWallet(match[1]!);
      if (walletName) toWallet = walletName;
    }
  }

  // Jika tidak ada pola, coba deteksi dari mention wallet
  if (!fromWallet && !toWallet) {
    const walletName = normalizeWallet(lower);
    if (walletName) {
      // Asumsikan sebagai fromWallet untuk expense, toWallet untuk income
      // (Ditentukan nanti dari type transaksi)
      fromWallet = walletName;
    }
  }

  return { fromWallet, toWallet };
}

/**
 * Deteksi tipe transaksi dari teks
 */
export function detectTransactionType(text: string): "INCOME" | "EXPENSE" | "TRANSFER" | null {
  const lower = text.toLowerCase();

  // Transfer keywords
  if (/\b(?:transfer|kirim|pindah|top\s*up|isi\s*saldo|deposit)\b/i.test(lower)) {
    return "TRANSFER";
  }

  // Income keywords
  if (/\b(?:gaji|dapat|terima|bonus|freelance|proyek|thr|pendapatan|masuk)\b/i.test(lower)) {
    return "INCOME";
  }

  // Expense keywords (paling umum, jadi terakhir)
  if (/\b(?:bayar|beli|makan|minum|naik|bensin|parkir|langganan|bayarin|ngopi|nonton)\b/i.test(lower)) {
    return "EXPENSE";
  }

  // Default: cek struktur kalimat
  // "X pake Y" → expense
  if (/\b(?:pake|pakai|dari)\b/i.test(lower) && !/\b(?:ke|topup)\b/i.test(lower)) {
    return "EXPENSE";
  }

  return null;
}