/**
 * Info Aplikasi
 */
export const APP_NAME = "ZenDompi";
export const APP_VERSION = "1.0.0"; // Saran: Di masa depan, ambil ini langsung dari package.json
export const APP_DESCRIPTION = "Smart Finance Tracker with AI-powered chat bot";

/**
 * Konstanta Waktu (dalam Milidetik)
 * Membantu standardisasi perhitungan waktu di seluruh aplikasi
 */
export const MINUTE_IN_MS = 60 * 1000;
export const HOUR_IN_MS = 60 * MINUTE_IN_MS;
export const DAY_IN_MS = 24 * HOUR_IN_MS;

/**
 * Pengaturan Sesi (Session)
 */
export const SESSION_MAX_AGE_DAYS = 30;
export const SESSION_MAX_AGE_MS = SESSION_MAX_AGE_DAYS * DAY_IN_MS;

/**
 * Pengaturan OTP
 */
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_DEV_BYPASS = "000000"; // Untuk development

/**
 * Rate Limiting
 */
export const OTP_RATE_LIMIT_PER_PHONE = 3; 
export const OTP_RATE_LIMIT_PHONE_WINDOW_MS = 5 * MINUTE_IN_MS; // 3 request per 5 menit

export const OTP_RATE_LIMIT_PER_IP = 10; 
export const OTP_RATE_LIMIT_IP_WINDOW_MS = 15 * MINUTE_IN_MS; // 10 request per 15 menit