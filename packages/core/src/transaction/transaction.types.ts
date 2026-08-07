import type { TransactionType } from "@zendompi/database";

export type CreateTransactionCommand = {
  userId: string;
  walletId: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description?: string;
  categoryId?: string;
  date?: Date;
};

export type UpdateTransactionCommand = {
  transactionId: string;
  userId: string;
  description?: string;
  categoryId?: string | null;
  date?: Date;
};

export type TransactionFilter = {
  userId: string;
  type?: "INCOME" | "EXPENSE" | "TRANSFER";
  walletId?: string;
  categoryId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sort?: "newest" | "oldest" | "largest" | "smallest";
  page?: number;
  limit?: number;
};

export type TransactionResult = {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  date: string;
  wallet: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
    icon: string | null;
  } | null;
};