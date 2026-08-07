/**
 * Kode mata uang (ISO 4217)
 */
export const Currency = {
  IDR: "IDR", // Indonesia
  USD: "USD", // Amerika Serikat
  CNY: "CNY", // China (Yuan Renminbi)
  JPY: "JPY", // Jepang (Yen)
  KRW: "KRW", // Korea Selatan (Won)
  VND: "VND", // Vietnam (Dong)
  SGD: "SGD", // Singapura (Dollar)
} as const;

export type Currency = (typeof Currency)[keyof typeof Currency];

/**
 * Simbol mata uang
 */
export const CurrencySymbol: Record<Currency, string> = {
  IDR: "Rp",
  USD: "$",
  CNY: "¥",
  JPY: "¥",   // JPY dan CNY menggunakan simbol yang sama. 
  KRW: "₩",
  VND: "₫",
  SGD: "S$",  // Menggunakan S$ agar tidak tertukar dengan USD di UI
};

/**
 * Locale untuk formatting
 * (Digunakan untuk Intl.NumberFormat)
 */
export const CurrencyLocale: Record<Currency, string> = {
  IDR: "id-ID",
  USD: "en-US",
  CNY: "zh-CN",
  JPY: "ja-JP",
  KRW: "ko-KR",
  VND: "vi-VN",
  SGD: "en-SG",
};