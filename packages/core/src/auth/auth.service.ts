import {
  getUserByTelegramId,
  createUser as dbCreateUser,
} from "@zendompi/database";
import { CoreError } from "../errors";
import { validateRequestOTP, validateLogin, validateRegister } from "./auth.validator";
import { otpService } from "./otp.service";
import type { LoginCommand, RegisterCommand, RequestOTPCommand, AuthResult } from "./auth.types";

export class AuthService {
  /**
   * Request OTP untuk login/register
   * 
   * 1. Validasi input
   * 2. Generate OTP
   * 3. Store OTP
   * 4. Return OTP (untuk dikirim via Telegram/WA oleh adapter)
   */
  async requestOTP(cmd: RequestOTPCommand): Promise<{ otp: string; isExistingUser: boolean }> {
    // 1. Validasi
    validateRequestOTP(cmd);

    // 2. Cek apakah user sudah terdaftar
    const existingUser = await getUserByTelegramId(cmd.telegramId);

    // 3. Cek rate limit (user sudah punya OTP valid)
    if (otpService.hasValidOTP(cmd.telegramId)) {
      throw new CoreError(
        "Kode OTP sudah dikirim. Tunggu 5 menit atau cek chat Telegram kamu.",
        "OTP_ALREADY_SENT",
        429
      );
    }

    // 4. Generate & store OTP
    const otp = otpService.generate();
    otpService.store(cmd.telegramId, otp);

    return {
      otp,
      isExistingUser: !!existingUser,
    };
  }

  /**
   * Login dengan OTP
   * 
   * 1. Validasi input
   * 2. Verifikasi OTP
   * 3. Cari user by telegramId
   * 4. Jika belum ada, auto-register
   * 5. Return user + isNewUser flag
   */
  async login(cmd: LoginCommand): Promise<AuthResult> {
    // 1. Validasi
    validateLogin(cmd);

    // 2. Verifikasi OTP
    const isValid = otpService.verify(cmd.telegramId, cmd.otp);
    if (!isValid) {
      throw new CoreError(
        "Kode OTP tidak valid atau sudah kadaluarsa.",
        "INVALID_OTP",
        401
      );
    }

    // 3. Cari user
    let user = await getUserByTelegramId(cmd.telegramId);
    let isNewUser = false;

    // 4. Auto-register jika user belum ada
    if (!user) {
      user = await dbCreateUser({
        telegramId: cmd.telegramId,
        name: `User ${cmd.telegramId.slice(-4)}`,
      });
      isNewUser = true;
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        telegramId: user.telegramId,
        whatsappNo: user.whatsappNo,
        image: user.image,
        role: user.role,
      },
      isNewUser,
    };
  }

  /**
   * Register user baru (sebelum OTP)
   * 
   * 1. Validasi input
   * 2. Cek apakah telegramId sudah terdaftar
   * 3. Generate OTP
   * 4. Store OTP
   */
  async register(cmd: RegisterCommand): Promise<{ otp: string }> {
    // 1. Validasi
    validateRegister(cmd);

    // 2. Cek duplikasi
    const existing = await getUserByTelegramId(cmd.telegramId);
    if (existing) {
      throw new CoreError(
        "Telegram ID sudah terdaftar. Silakan login.",
        "USER_ALREADY_EXISTS",
        409
      );
    }

    // 3. Generate & store OTP
    const otp = otpService.generate();
    otpService.store(cmd.telegramId, otp);

    return { otp };
  }

  /**
   * Verify OTP & complete registration
   */
  async verifyRegister(cmd: LoginCommand & { name?: string }): Promise<AuthResult> {
    // 1. Validasi
    validateLogin(cmd);

    // 2. Verifikasi OTP
    const isValid = otpService.verify(cmd.telegramId, cmd.otp);
    if (!isValid) {
      throw new CoreError("Kode OTP tidak valid atau sudah kadaluarsa.", "INVALID_OTP", 401);
    }

    // 3. Buat user
    const user = await dbCreateUser({
      telegramId: cmd.telegramId,
      name: cmd.name,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        telegramId: user.telegramId,
        whatsappNo: user.whatsappNo,
        image: user.image,
        role: user.role,
      },
      isNewUser: true,
    };
  }

  /**
   * Logout — revoke OTP/session
   */
  async logout(telegramId: string): Promise<void> {
    otpService.revoke(telegramId);
  }
}

export const authService = new AuthService();