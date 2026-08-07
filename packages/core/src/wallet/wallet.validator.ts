import { CoreError } from "../errors";
import type { CreateWalletCommand, UpdateWalletCommand } from "./wallet.types";

export function validateCreateWallet(cmd: CreateWalletCommand): void {
  // Required fields
  if (!cmd.userId) {
    throw new CoreError("User ID diperlukan", "MISSING_USER_ID", 400);
  }

  if (!cmd.name || cmd.name.trim().length === 0) {
    throw new CoreError("Nama wallet tidak boleh kosong", "MISSING_NAME", 400);
  }

  // Name length
  const trimmedName = cmd.name.trim();
  if (trimmedName.length < 2) {
    throw new CoreError("Nama wallet minimal 2 karakter", "NAME_TOO_SHORT", 400);
  }

  if (trimmedName.length > 50) {
    throw new CoreError("Nama wallet maksimal 50 karakter", "NAME_TOO_LONG", 400);
  }

  // Name format (alfanumerik + spasi)
  if (!/^[a-zA-Z0-9\s\-_.&()+]+$/.test(trimmedName)) {
    throw new CoreError(
      "Nama wallet hanya boleh berisi huruf, angka, spasi, dan karakter -_.&()+",
      "INVALID_NAME_FORMAT",
      400
    );
  }

  // Initial balance
  if (cmd.initialBalance !== undefined) {
    if (typeof cmd.initialBalance !== "number" || isNaN(cmd.initialBalance)) {
      throw new CoreError("Saldo awal harus berupa angka", "INVALID_BALANCE", 400);
    }

    if (cmd.initialBalance < 0) {
      throw new CoreError("Saldo awal tidak boleh negatif", "NEGATIVE_BALANCE", 400);
    }

    if (cmd.initialBalance > 999_999_999_999) {
      throw new CoreError(
        "Saldo awal terlalu besar (maks Rp 999.999.999.999)",
        "BALANCE_TOO_LARGE",
        400
      );
    }
  }

  // Currency
  if (cmd.currency && !["IDR", "USD"].includes(cmd.currency)) {
    throw new CoreError("Mata uang tidak didukung. Gunakan IDR atau USD.", "INVALID_CURRENCY", 400);
  }
}

export function validateUpdateWallet(cmd: UpdateWalletCommand): void {
  if (!cmd.walletId) {
    throw new CoreError("Wallet ID diperlukan", "MISSING_WALLET_ID", 400);
  }

  if (!cmd.userId) {
    throw new CoreError("User ID diperlukan", "MISSING_USER_ID", 400);
  }

  if (cmd.name !== undefined) {
    if (cmd.name.trim().length < 2) {
      throw new CoreError("Nama wallet minimal 2 karakter", "NAME_TOO_SHORT", 400);
    }
    if (cmd.name.trim().length > 50) {
      throw new CoreError("Nama wallet maksimal 50 karakter", "NAME_TOO_LONG", 400);
    }
  }
}