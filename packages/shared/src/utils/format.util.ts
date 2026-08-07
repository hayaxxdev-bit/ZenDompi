import { Currency, CurrencyLocale } from "../enums";

/**
 * Format angka ke Rupiah (atau mata uang lain)
 */
export function formatCurrency(
  amount: number,
  currency: string = Currency.IDR,
  options?: { compact?: boolean; showSymbol?: boolean }
): string {
  const locale = CurrencyLocale[currency as keyof typeof CurrencyLocale] || "id-ID";
  const symbol = options?.showSymbol !== false ? "" : "";

  if (options?.compact) {
    return formatCompact(amount, currency);
  }

  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

    return formatted;
  } catch {
    // Fallback untuk currency yang tidak didukung Intl
    return `${symbol} ${amount.toLocaleString(locale)}`;
  }
}

/**
 * Format compact: 1.500.000 → "1,5jt"
 */
export function formatCompact(amount: number, currency: string = Currency.IDR): string {
  const symbol = currency === Currency.IDR ? "Rp" : "$";

  if (amount >= 1_000_000_000) {
    const m = amount / 1_000_000_000;
    return `${symbol} ${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }

  if (amount >= 1_000_000) {
    const jt = amount / 1_000_000;
    return `${symbol} ${jt % 1 === 0 ? jt.toFixed(0) : jt.toFixed(1)}jt`;
  }

  if (amount >= 1_000) {
    const rb = amount / 1_000;
    return `${symbol} ${rb % 1 === 0 ? rb.toFixed(0) : rb.toFixed(1)}rb`;
  }

  return `${symbol} ${amount.toLocaleString("id-ID")}`;
}

/**
 * Format Rupiah (shortcut)
 */
export function formatRupiah(amount: number, compact = false): string {
  return compact ? formatCompact(amount, Currency.IDR) : formatCurrency(amount, Currency.IDR);
}

/**
 * Format persentase
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}