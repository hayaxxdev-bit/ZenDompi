/**
 * Simple in-memory rate limiter untuk OTP
 * 
 * Untuk production, gunakan Upstash Redis:
 * import { Ratelimit } from "@upstash/ratelimit";
 * import { Redis } from "@upstash/redis";
 */

type RateLimitEntry = {
  count: number;
  resetTime: number;
  blockedUntil?: number;
};

const rateLimitMap = new Map<string, RateLimitEntry>();

// Cleanup old entries setiap 10 menit
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000);

/**
 * Rate limiter untuk OTP request
 * 
 * Rules:
 * - Max 3 OTP requests per 5 menit per phone number
 * - Max 10 OTP requests per 15 menit per IP
 * - Block 15 menit jika melebihi limit
 */
export function checkOTPRateLimit(
  phoneNumber: string,
  ip: string
): { allowed: boolean; retryAfter?: number; message?: string } {
  const now = Date.now();
  const phoneKey = `otp:phone:${phoneNumber}`;
  const ipKey = `otp:ip:${ip}`;

  // Check phone number limit
  const phoneEntry = rateLimitMap.get(phoneKey);
  if (phoneEntry) {
    // Check if blocked
    if (phoneEntry.blockedUntil && now < phoneEntry.blockedUntil) {
      const retryAfter = Math.ceil((phoneEntry.blockedUntil - now) / 1000);
      return {
        allowed: false,
        retryAfter,
        message: `Terlalu banyak permintaan. Coba lagi dalam ${Math.ceil(retryAfter / 60)} menit.`,
      };
    }

    // Reset if window passed
    if (now > phoneEntry.resetTime) {
      rateLimitMap.set(phoneKey, {
        count: 1,
        resetTime: now + 5 * 60 * 1000, // 5 menit
      });
    } else if (phoneEntry.count >= 3) {
      // Block for 15 minutes
      phoneEntry.blockedUntil = now + 15 * 60 * 1000;
      return {
        allowed: false,
        retryAfter: 15 * 60,
        message: "Terlalu banyak permintaan OTP. Coba lagi dalam 15 menit.",
      };
    } else {
      phoneEntry.count++;
    }
  } else {
    rateLimitMap.set(phoneKey, {
      count: 1,
      resetTime: now + 5 * 60 * 1000,
    });
  }

  // Check IP limit
  const ipEntry = rateLimitMap.get(ipKey);
  if (ipEntry) {
    if (ipEntry.blockedUntil && now < ipEntry.blockedUntil) {
      const retryAfter = Math.ceil((ipEntry.blockedUntil - now) / 1000);
      return {
        allowed: false,
        retryAfter,
        message: `Terlalu banyak permintaan dari IP ini. Coba lagi dalam ${Math.ceil(retryAfter / 60)} menit.`,
      };
    }

    if (now > ipEntry.resetTime) {
      rateLimitMap.set(ipKey, {
        count: 1,
        resetTime: now + 15 * 60 * 1000, // 15 menit
      });
    } else if (ipEntry.count >= 10) {
      ipEntry.blockedUntil = now + 30 * 60 * 1000;
      return {
        allowed: false,
        retryAfter: 30 * 60,
        message: "Terlalu banyak permintaan. Coba lagi dalam 30 menit.",
      };
    } else {
      ipEntry.count++;
    }
  } else {
    rateLimitMap.set(ipKey, {
      count: 1,
      resetTime: now + 15 * 60 * 1000,
    });
  }

  return { allowed: true };
}