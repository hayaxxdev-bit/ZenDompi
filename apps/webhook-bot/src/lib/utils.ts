/**
 * Utility functions untuk Webhook Bot
 */

/**
 * Format angka ke Rupiah
 */
export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

/**
 * Parse nominal dari string
 * "50rb" → 50000, "1.5jt" → 1500000
 */
export function parseAmount(text: string): number | null {
  // Match "1.5jt", "50rb", "100ribu"
  const match = text.match(/(\d+[.,]?\d*)\s*(rb|ribu|jt|juta|k)/i);
  
  // Guard check: pastikan match dan capture groups [1] serta [2] tidak undefined
  if (!match || !match[1] || !match[2]) return null;

  const numStr = match[1].replace(",", ".");
  const num = parseFloat(numStr);
  const suffix = match[2].toLowerCase();

  const multipliers: Record<string, number> = {
    rb: 1_000,
    ribu: 1_000,
    jt: 1_000_000,
    juta: 1_000_000,
    k: 1_000,
  };

  const multiplier = multipliers[suffix] || 1;
  return Math.round(num * multiplier);
}

/**
 * Sleep helper
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Truncate string
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Log dengan timestamp
 */
export function log(level: "info" | "warn" | "error", message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (level === "error") {
    console.error(prefix, message, data || "");
  } else if (level === "warn") {
    console.warn(prefix, message, data || "");
  } else {
    console.log(prefix, message, data || "");
  }
}