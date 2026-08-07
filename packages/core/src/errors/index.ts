/**
 * Core error — dilempar oleh service layer
 */
export class CoreError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 400) {
    super(message);
    this.name = "CoreError";
    this.code = code;
    this.statusCode = statusCode;
  }

  toJSON() {
    return {
      error: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}

export class InsufficientBalanceError extends CoreError {
  constructor(balance: number, required: number) {
    super(
      `Saldo tidak cukup. Saldo: Rp ${balance.toLocaleString("id-ID")}, Dibutuhkan: Rp ${required.toLocaleString("id-ID")}`,
      "INSUFFICIENT_BALANCE",
      422
    );
  }
}

export class WalletNotFoundError extends CoreError {
  constructor(walletId: string) {
    super(`Wallet dengan ID ${walletId} tidak ditemukan`, "WALLET_NOT_FOUND", 404);
  }
}

export class WalletArchivedError extends CoreError {
  constructor(walletName: string) {
    super(`Wallet "${walletName}" sedang diarsipkan`, "WALLET_ARCHIVED", 422);
  }
}

export class DuplicateWalletError extends CoreError {
  constructor(walletName: string) {
    super(`Wallet "${walletName}" sudah ada`, "DUPLICATE_WALLET", 409);
  }
}

export class MaxWalletsError extends CoreError {
  constructor(max: number) {
    super(`Maksimum ${max} wallet per user`, "MAX_WALLETS", 422);
  }
}