import type { TransactionType } from "../enums";
import type { ID } from "../types";

/**
 * DTO untuk membuat transaksi
 */
export type CreateTransactionDTO = {
  type: TransactionType;
  amount: number;
  description: string;
  walletId: ID;
  toWalletId?: ID; // Hanya untuk transfer
  categoryId?: ID;
  transactionDate?: string;
};

/**
 * DTO untuk response transaksi (list)
 */
export type TransactionResponseDTO = {
  id: ID;
  type: string;
  description: string;
  amount: number;
  date: string;
  category: {
    id: ID;
    name: string;
    icon: string;
  } | null;
  wallets: string;
};

/**
 * DTO untuk response transaksi (detail)
 */
export type TransactionDetailResponseDTO = TransactionResponseDTO & {
  createdAt: string;
  entries: {
    id: ID;
    walletName: string;
    walletType: string;
    accountType: string;
    amount: number;
    label: string;
  }[];
};