/**
 * DTO untuk request OTP
 */
export type RequestOTPDTO = {
  telegramId: string;
};

/**
 * DTO untuk verifikasi OTP
 */
export type VerifyOTPDTO = {
  telegramId: string;
  otp: string;
};

/**
 * DTO untuk response OTP
 */
export type OTPResponseDTO = {
  success: boolean;
  message: string;
  expiresIn: number;
  userName?: string;
};