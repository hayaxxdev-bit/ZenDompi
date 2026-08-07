import { CoreError } from "../errors";
import type { LoginCommand, RegisterCommand, RequestOTPCommand } from "./auth.types";

export function validateRequestOTP(cmd: RequestOTPCommand): void {
  if (!cmd.telegramId || cmd.telegramId.trim() === "") {
    throw new CoreError("Telegram ID diperlukan", "MISSING_telegram_ID", 400);
  }

  const id = parseInt(cmd.telegramId);
  if (isNaN(id) || id <= 0) {
    throw new CoreError("Telegram ID tidak valid. Harus berupa angka positif.", "INVALID_telegram_ID", 400);
  }
}

export function validateLogin(cmd: LoginCommand): void {
  if (!cmd.telegramId) {
    throw new CoreError("Telegram ID diperlukan", "MISSING_telegram_ID", 400);
  }

  if (!cmd.otp || cmd.otp.trim().length !== 6) {
    throw new CoreError("Kode OTP harus 6 digit", "INVALID_OTP", 400);
  }

  if (!/^\d{6}$/.test(cmd.otp.trim())) {
    throw new CoreError("Kode OTP harus berupa angka", "INVALID_OTP_FORMAT", 400);
  }
}

export function validateRegister(cmd: RegisterCommand): void {
  if (!cmd.telegramId) {
    throw new CoreError("Telegram ID diperlukan", "MISSING_telegram_ID", 400);
  }

  if (cmd.name && cmd.name.length < 2) {
    throw new CoreError("Nama minimal 2 karakter", "INVALID_NAME", 400);
  }

  if (cmd.name && cmd.name.length > 100) {
    throw new CoreError("Nama maksimal 100 karakter", "NAME_TOO_LONG", 400);
  }
}