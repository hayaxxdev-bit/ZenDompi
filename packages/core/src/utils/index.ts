import { CoreError } from "../errors"; // Sesuaikan ekstensi jika diperlukan (misal: "../errors.js")

/**
 * Assert condition, throw CoreError jika false
 */
export function assert(condition: boolean, message: string, code: string, statusCode = 400): void {
  if (!condition) {
    throw new CoreError(message, code, statusCode);
  }
}

/**
 * Assert not null
 */
export function assertNotNull<T>(
  value: T | null | undefined,
  message: string,
  code = "NOT_FOUND",
  statusCode = 404
): asserts value is T {
  if (value === null || value === undefined) {
    throw new CoreError(message, code, statusCode);
  }
}

/**
 * Safe parse number
 */
export function parseAmount(value: unknown): number {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    throw new CoreError("Jumlah tidak valid", "INVALID_AMOUNT", 400);
  }
  return num;
}