import { z } from "zod";
import { TransactionType } from "../enums";
import {
  TRANSACTION_AMOUNT_MIN,
  TRANSACTION_AMOUNT_MAX,
  TRANSACTION_DESCRIPTION_MIN_LENGTH,
  TRANSACTION_DESCRIPTION_MAX_LENGTH,
} from "../constants";

/**
 * Schema untuk membuat transaksi
 */
export const createTransactionSchema = z
  .object({
    type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE, TransactionType.TRANSFER]),
    amount: z
      .number()
      .min(TRANSACTION_AMOUNT_MIN, `Minimal transaksi Rp ${TRANSACTION_AMOUNT_MIN}`)
      .max(TRANSACTION_AMOUNT_MAX, `Maksimal transaksi Rp ${TRANSACTION_AMOUNT_MAX.toLocaleString()}`),
    description: z
      .string()
      .min(TRANSACTION_DESCRIPTION_MIN_LENGTH, "Deskripsi tidak boleh kosong")
      .max(TRANSACTION_DESCRIPTION_MAX_LENGTH, `Maksimal ${TRANSACTION_DESCRIPTION_MAX_LENGTH} karakter`),
    walletId: z.string().uuid("Wallet ID tidak valid"),
    toWalletId: z.string().uuid("Wallet tujuan tidak valid").optional(),
    categoryId: z.string().uuid("Kategori tidak valid").optional(),
    transactionDate: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      // Transfer harus punya toWalletId
      if (data.type === TransactionType.TRANSFER && !data.toWalletId) {
        return false;
      }
      return true;
    },
    {
      message: "Transfer membutuhkan wallet tujuan",
      path: ["toWalletId"],
    }
  )
  .refine(
    (data) => {
      // Wallet sumber dan tujuan tidak boleh sama
      if (data.type === TransactionType.TRANSFER && data.walletId === data.toWalletId) {
        return false;
      }
      return true;
    },
    {
      message: "Wallet sumber dan tujuan tidak boleh sama",
      path: ["toWalletId"],
    }
  );

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;

/**
 * Schema untuk filter transaksi
 */
export const transactionFilterSchema = z.object({
  type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE, TransactionType.TRANSFER]).optional(),
  walletId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sort: z.enum(["newest", "oldest", "largest", "smallest"]).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
});

export type TransactionFilterSchema = z.infer<typeof transactionFilterSchema>;