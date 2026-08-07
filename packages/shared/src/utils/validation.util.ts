/**
 * Validasi nomor telepon Indonesia
 */
export function isValidPhoneNumber(phone: string): boolean {
  // +62 atau 62 atau 0 di depan
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  const regex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
  return regex.test(cleaned);
}

/**
 * Validasi email
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validasi UUID
 */
export function isValidUUID(str: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(str);
}

/**
 * Normalisasi nomor telepon ke format +62
 */
export function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
  if (!cleaned.startsWith("62")) cleaned = "62" + cleaned;
  return `+${cleaned}`;
}

/**
 * Parse nominal dari string: "50rb" → 50000, "1.5jt" → 1500000
 */
export function parseAmount(text: string): number | null {
  const match = text.match(/([\d,.]+)\s*(rb|ribu|jt|juta|k|m|miliar)?/i);
  
  // 1. Ensure match and the number group actually exist
  if (!match || !match[1]) return null;

  const numStr = match[1].replace(/\./g, "").replace(",", ".");
  const num = parseFloat(numStr);

  // 2. Protect against inputs like "." or "," that parse as NaN
  if (isNaN(num)) return null;

  const suffix = match[2]?.toLowerCase() || "";

  const multipliers: Record<string, number> = {
    rb: 1_000,
    ribu: 1_000,
    k: 1_000,
    jt: 1_000_000,
    juta: 1_000_000,
    m: 1_000_000_000, 
    miliar: 1_000_000_000,
  };

  return Math.round(num * (multipliers[suffix] || 1));
}