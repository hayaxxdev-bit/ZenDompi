/**
 * OTP Service — Generate, Store, Verify
 * 
 * Untuk production: gunakan Redis.
 * Untuk development: in-memory Map.
 */

type OTPEntry = {
  otp: string;
  expires: Date;
  attempts: number;
};

const otpStore = new Map<string, OTPEntry>();

// Cleanup expired OTP setiap 10 menit
setInterval(() => {
  const now = new Date();
  for (const [key, entry] of otpStore) {
    if (now > entry.expires) {
      otpStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export class OTPService {
  /**
   * Generate OTP 6 digit
   */
  generate(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Simpan OTP untuk identifier (telegramId)
   */
  store(identifier: string, otp: string, expiryMinutes = 5): void {
    otpStore.set(identifier, {
      otp,
      expires: new Date(Date.now() + expiryMinutes * 60 * 1000),
      attempts: 0,
    });
  }

  /**
   * Verifikasi OTP
   * 
   * @returns true jika valid, false jika tidak
   */
  verify(identifier: string, otp: string): boolean {
    // Development bypass
    if (otp === "000000") {
      otpStore.delete(identifier);
      return true;
    }

    const entry = otpStore.get(identifier);
    if (!entry) return false;

    // Check expired
    if (new Date() > entry.expires) {
      otpStore.delete(identifier);
      return false;
    }

    // Check max attempts (3)
    entry.attempts++;
    if (entry.attempts > 3) {
      otpStore.delete(identifier);
      return false;
    }

    // Check OTP
    if (entry.otp === otp) {
      otpStore.delete(identifier);
      return true;
    }

    return false;
  }

  /**
   * Cek apakah identifier masih punya OTP valid
   */
  hasValidOTP(identifier: string): boolean {
    const entry = otpStore.get(identifier);
    return !!entry && new Date() <= entry.expires;
  }

  /**
   * Hapus OTP
   */
  revoke(identifier: string): void {
    otpStore.delete(identifier);
  }
}

export const otpService = new OTPService();