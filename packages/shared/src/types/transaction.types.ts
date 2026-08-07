import type { ID, Timestamp, Nullable } from "./common.types";
import type { TransactionType } from "../enums";

/**
 * Transaksi dasar
 */
export type Transaction = {
  id: ID;
  userId: ID;
  type: TransactionType;
  description: string;
  totalAmount: number;
  transactionDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  categoryId: Nullable<ID>;
};

/**
 * Ledger entry (double-entry)
 */
export type LedgerEntry = {
  id: ID;
  transactionId: ID;
  walletId: ID;
  accountType: "debit" | "credit";
  amount: number;
};

/**
 * Transaksi dengan relasi
 */
export type TransactionWithRelations = Transaction & {
  category: Nullable<{
    id: ID;
    name: string;
    icon: string;
  }>;
  entries: (LedgerEntry & {
    wallet: {
      id: ID;
      name: string;
      type: string;
    };
  })[];
};

/**
 * Input untuk membuat transaksi
 */
export type CreateTransactionInput = {
  type: TransactionType;
  amount: number;
  description: string;
  walletId: ID;
  toWalletId?: ID; // Untuk transfer
  categoryId?: ID;
  transactionDate?: Date | string;
};

/**
 * Filter transaksi
 */
export type TransactionFilter = {
  type?: TransactionType;
  walletId?: ID;
  categoryId?: ID;
  search?: string;
  startDate?: string;
  endDate?: string;
  sort?: "newest" | "oldest" | "largest" | "smallest";
  page?: number;
  limit?: number;
};

/**
 * Ringkasan transaksi untuk list
 */
export type TransactionSummary = {
  id: ID;
  type: TransactionType;
  description: string;
  amount: number;
  date: Timestamp;
  category: Nullable<{
    id: ID;
    name: string;
    icon: string;
  }>;
  wallets: string; // "BCA → OVO" atau "GoPay"
};