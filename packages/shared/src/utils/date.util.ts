/**
 * Format tanggal ke string Indonesia
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(d);
}

/**
 * Format tanggal dengan jam
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format relative time: "2 jam yang lalu", "3 hari yang lalu"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;

  return formatDate(d);
}

/**
 * Awal bulan
 */
export function startOfMonth(date?: Date): Date {
  const d = date || new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/**
 * Akhir bulan
 */
export function endOfMonth(date?: Date): Date {
  const d = date || new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

/**
 * Format ISO date (YYYY-MM-DD)
 */
export function toISODate(date: Date): string {
  return date.toISOString().split("T")[0]!;
}