import { z } from "zod";
import { WalletType, Currency } from "../enums";
import { WALLET_NAME_MIN_LENGTH, WALLET_NAME_MAX_LENGTH } from "../constants";

/**
 * Schema untuk membuat wallet
 */
export const createWalletSchema = z.object({
  name: z
    .string()
    .min(WALLET_NAME_MIN_LENGTH, `Nama minimal ${WALLET_NAME_MIN_LENGTH} karakter`)
    .max(WALLET_NAME_MAX_LENGTH, `Nama maksimal ${WALLET_NAME_MAX_LENGTH} karakter`),
  type: z.enum([WalletType.BANK, WalletType.E_WALLET, WalletType.CASH]),
  initialBalance: z
    .number()
    .min(0, "Saldo awal tidak boleh negatif")
    .max(999_999_999_999, "Saldo awal terlalu besar")
    .optional()
    .default(0),
  currency: z.enum([Currency.IDR, Currency.USD]).optional().default(Currency.IDR),
});

export type CreateWalletSchema = z.infer<typeof createWalletSchema>;

/**
 * Schema untuk update wallet
 */
export const updateWalletSchema = z.object({
  name: z
    .string()
    .min(WALLET_NAME_MIN_LENGTH)
    .max(WALLET_NAME_MAX_LENGTH)
    .optional(),
  isArchived: z.boolean().optional(),
});

export type UpdateWalletSchema = z.infer<typeof updateWalletSchema>;