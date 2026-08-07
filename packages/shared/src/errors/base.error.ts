/**
 * Base error class untuk ZenDompi
 * Semua error custom extends dari sini
 */
export class ZenDompiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: string = "INTERNAL_ERROR",
    statusCode: number = 500,
    details?: unknown
  ) {
    super(message);
    this.name = "ZenDompiError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Perbaikan: Pengecekan aman untuk environment non-V8 (Safari/Firefox)
    // dan bypass TS error menggunakan (as any)
    if (typeof (Error as any).captureStackTrace === "function") {
      (Error as any).captureStackTrace(this, this.constructor);
    } else {
      // Fallback fallback untuk merekam stack trace di browser lain
      this.stack = new Error(message).stack;
    }
  }

  /**
   * Convert ke JSON untuk API response
   */
  toJSON() {
    return {
      error: this.code,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.details !== undefined ? { details: this.details } : {}),
    };
  }
}

/**
 * 400 - Bad Request
 * Digunakan saat input user tidak valid (contoh: validasi gagal)
 */
export class BadRequestError extends ZenDompiError {
  constructor(message: string = "Input tidak valid", details?: unknown) {
    super(message, "BAD_REQUEST", 400, details);
    this.name = "BadRequestError";
  }
}

/**
 * 401 - Unauthorized
 * Digunakan saat user belum login atau token kedaluwarsa
 */
export class UnauthorizedError extends ZenDompiError {
  constructor(message: string = "Anda belum terautentikasi", details?: unknown) {
    super(message, "UNAUTHORIZED", 401, details);
    this.name = "UnauthorizedError";
  }
}

/**
 * 403 - Forbidden
 * Digunakan saat user login, tapi tidak punya akses ke resource tertentu
 */
export class ForbiddenError extends ZenDompiError {
  constructor(message: string = "Anda tidak memiliki akses", details?: unknown) {
    super(message, "FORBIDDEN", 403, details);
    this.name = "ForbiddenError";
  }
}

/**
 * 404 - Not Found
 * Digunakan saat data tidak ditemukan
 */
export class NotFoundError extends ZenDompiError {
  constructor(message: string = "Data tidak ditemukan", details?: unknown) {
    super(message, "NOT_FOUND", 404, details);
    this.name = "NotFoundError";
  }
}