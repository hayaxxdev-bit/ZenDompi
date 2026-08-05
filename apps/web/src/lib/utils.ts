import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Format angka ke Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format angka compact (1.5jt, 500rb)
 */
export function formatCompact(amount: number): string {
  if (amount >= 1_000_000) {
    const jt = amount / 1_000_000;
    return jt % 1 === 0 ? `${jt}jt` : `${jt.toFixed(1)}jt`;
  }
  if (amount >= 1_000) {
    const rb = amount / 1_000;
    return rb % 1 === 0 ? `${rb}rb` : `${rb.toFixed(1)}rb`;
  }
  return amount.toString();
}

/**
 * Format tanggal ke string Indonesia
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Classname merger utility (Clsx + Tailwind Merge)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}