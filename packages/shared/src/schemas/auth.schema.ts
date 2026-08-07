import { z } from "zod";
import { OTP_LENGTH } from "../constants";

/**
 * Schema untuk request OTP
 */
export const requestOTPSchema = z.object({
  telegramId: z
    .string()
    .regex(/^\d+$/, "Telegram ID harus berupa angka")
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .positive("Telegram ID harus positif")
        .int("Telegram ID harus bilangan bulat")
    ),
});

export type RequestOTPSchema = z.infer<typeof requestOTPSchema>;

/**
 * Schema untuk verifikasi OTP
 */
export const verifyOTPSchema = z.object({
  telegramId: z
    .string()
    .regex(/^\d+$/, "Telegram ID harus berupa angka")
    .transform((val) => parseInt(val, 10)),
  otp: z
    .string()
    .length(OTP_LENGTH, `OTP harus ${OTP_LENGTH} digit`)
    .regex(/^\d+$/, "OTP harus berupa angka"),
});

export type VerifyOTPSchema = z.infer<typeof verifyOTPSchema>;

/**
 * Schema untuk update profil
 */
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .optional(),
  email: z
    .string()
    .email("Email tidak valid")
    .max(255, "Email maksimal 255 karakter")
    .optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;