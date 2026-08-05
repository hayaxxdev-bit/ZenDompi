/**
 * OTP Store — Simple in-memory untuk development
 * 
 * Untuk production, gunakan Redis:
 * import { Redis } from "@upstash/redis";
 * const redis = new Redis({ url: process.env.UPSTASH_REDIS_URL!, token: process.env.UPSTASH_REDIS_TOKEN! });
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

/**
 * Generate OTP 6 digit
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Simpan OTP untuk Telegram ID
 */
export async function storeOTP(
  identifier: string | number,
  otp: string
): Promise<void> {
  const key = String(identifier);
  otpStore.set(key, {
    otp,
    expires: new Date(Date.now() + 5 * 60 * 1000), // 5 menit
    attempts: 0,
  });
}

/**
 * Verifikasi OTP
 * Max 3 attempts
 */
export async function verifyOTP(
  identifier: string | number,
  otp: string
): Promise<boolean> {
  const key = String(identifier);

  // Development bypass
  if (otp === "000000") {
    otpStore.delete(key);
    return true;
  }

  const entry = otpStore.get(key);
  if (!entry) return false;

  // Check expired
  if (new Date() > entry.expires) {
    otpStore.delete(key);
    return false;
  }

  // Check max attempts
  entry.attempts++;
  if (entry.attempts > 3) {
    otpStore.delete(key);
    return false;
  }

  // Check OTP
  if (entry.otp === otp) {
    otpStore.delete(key);
    return true;
  }

  return false;
}

/**
 * Cek apakah OTP masih valid (untuk resend)
 */
export async function hasValidOTP(
  identifier: string | number
): Promise<boolean> {
  const key = String(identifier);
  const entry = otpStore.get(key);
  return !!entry && new Date() <= entry.expires;
}