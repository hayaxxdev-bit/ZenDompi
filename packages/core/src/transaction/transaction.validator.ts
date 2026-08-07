import { CoreError } from "../errors";
import type { CreateTransactionCommand, UpdateTransactionCommand } from "./transaction.types";

export function validateCreateTransaction(cmd: CreateTransactionCommand): void {
  // Required fields
  if (!cmd.userId) {
    throw new CoreError("User ID diperlukan", "MISSING_USER_ID", 400);
  }

  if (!cmd.walletId) {
    throw new CoreError("Wallet ID diperlukan", "MISSING_WALLET_ID", 400);
  }

  if (!cmd.type) {
    throw new CoreError("Tipe transaksi diperlukan", "MISSING_TYPE", 400);
  }

  if (!["INCOME", "EXPENSE"].includes(cmd.type)) {
    throw new CoreError(
      "Tipe transaksi tidak valid. Gunakan INCOME atau EXPENSE.",
      "INVALID_TYPE",
      400
    );
  }

  // Amount validation
  if (cmd.amount === undefined || cmd.amount === null) {
    throw new CoreError("Jumlah transaksi diperlukan", "MISSING_AMOUNT", 400);
  }

  if (typeof cmd.amount !== "number" || isNaN(cmd.amount)) {
    throw new CoreError("Jumlah transaksi harus berupa angka", "INVALID_AMOUNT", 400);
  }

  if (cmd.amount <= 0) {
    throw new CoreError("Jumlah transaksi harus lebih besar dari 0", "AMOUNT_TOO_SMALL", 400);
  }

  if (cmd.amount > 999_999_999_999) {
    throw new CoreError(
      "Jumlah transaksi terlalu besar (maks Rp 999.999.999.999)",
      "AMOUNT_TOO_LARGE",
      400
    );
  }

  // Description validation
  if (cmd.description !== undefined && cmd.description !== null) {
    if (cmd.description.length > 500) {
      throw new CoreError("Deskripsi maksimal 500 karakter", "DESCRIPTION_TOO_LONG", 400);
    }
  }

  // Date validation
  if (cmd.date) {
    const dateObj = new Date(cmd.date);
    if (isNaN(dateObj.getTime())) {
      throw new CoreError("Format tanggal tidak valid", "INVALID_DATE", 400);
    }

    // Tidak boleh transaksi di masa depan (lebih dari 1 hari)
    const now = new Date();
    const oneDayAhead = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    if (dateObj > oneDayAhead) {
      throw new CoreError(
        "Tanggal transaksi tidak boleh lebih dari 1 hari di masa depan",
        "FUTURE_DATE",
        400
      );
    }
  }
}

export function validateUpdateTransaction(cmd: UpdateTransactionCommand): void {
  if (!cmd.transactionId) {
    throw new CoreError("Transaction ID diperlukan", "MISSING_TRANSACTION_ID", 400);
  }

  if (!cmd.userId) {
    throw new CoreError("User ID diperlukan", "MISSING_USER_ID", 400);
  }

  if (cmd.description !== undefined && cmd.description.length > 500) {
    throw new CoreError("Deskripsi maksimal 500 karakter", "DESCRIPTION_TOO_LONG", 400);
  }
}