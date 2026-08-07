import {
  createTransaction as dbCreateTransaction,
  updateTransaction as dbUpdateTransaction,
  deleteTransaction as dbDeleteTransaction,
  getTransaction as dbGetTransaction,
  listTransactions as dbListTransactions,
} from "@zendompi/database";
import {
  InsufficientBalanceError,
  WalletNotFoundError,
  WalletArchivedError,
  CoreError,
} from "../errors";
import { validateCreateTransaction, validateUpdateTransaction } from "./transaction.validator";
import type {
  CreateTransactionCommand,
  UpdateTransactionCommand,
  TransactionFilter,
} from "./transaction.types";

export class TransactionService {
  async create(cmd: CreateTransactionCommand) {
    // 1. Validasi
    validateCreateTransaction(cmd);

    // 2. Eksekusi
    try {
      const result = await dbCreateTransaction({
        userId: cmd.userId,
        walletId: cmd.walletId,
        type: cmd.type,
        amount: cmd.amount,
        description: cmd.description,
        categoryId: cmd.categoryId,
        date: cmd.date,
      });

      return {
        id: result.id,
        type: result.type,
        amount: result.amount.toNumber(),
        description: result.description,
        date: result.date.toISOString(),
      };
    } catch (error: any) {
      if (error.message?.includes("Saldo tidak cukup")) {
        throw new InsufficientBalanceError(0, cmd.amount);
      }
      if (error.message?.includes("tidak ditemukan")) {
        throw new WalletNotFoundError(cmd.walletId);
      }
      if (error.message?.includes("diarsipkan")) {
        throw new WalletArchivedError(cmd.walletId);
      }
      throw error;
    }
  }

  async update(cmd: UpdateTransactionCommand) {
    validateUpdateTransaction(cmd);

    const result = await dbUpdateTransaction({
      transactionId: cmd.transactionId,
      userId: cmd.userId,
      description: cmd.description,
      categoryId: cmd.categoryId,
      date: cmd.date,
    });

    return {
      id: result.id,
      description: result.description,
      categoryId: result.categoryId,
    };
  }

  async delete(transactionId: string, userId: string) {
    if (!transactionId) throw new CoreError("Transaction ID diperlukan", "MISSING_TRANSACTION_ID", 400);
    if (!userId) throw new CoreError("User ID diperlukan", "MISSING_USER_ID", 400);

    await dbDeleteTransaction(transactionId, userId);
    return { success: true };
  }

  async getById(transactionId: string, userId: string) {
    if (!transactionId) throw new CoreError("Transaction ID diperlukan", "MISSING_TRANSACTION_ID", 400);

    const tx = await dbGetTransaction(transactionId, userId);
    if (!tx) throw new CoreError("Transaksi tidak ditemukan", "TRANSACTION_NOT_FOUND", 404);

    return {
      id: tx.id,
      type: tx.type,
      amount: tx.amount.toNumber(),
      description: tx.description,
      date: tx.date.toISOString(),
      createdAt: tx.createdAt.toISOString(),
      wallet: tx.wallet,
      category: tx.category,
      transfer: tx.transfer
        ? {
            from: tx.transfer.fromWallet.name,
            to: tx.transfer.toWallet.name,
          }
        : null,
    };
  }

  async list(filter: TransactionFilter) {
    if (!filter.userId) throw new CoreError("User ID diperlukan", "MISSING_USER_ID", 400);

    const result = await dbListTransactions({
      userId: filter.userId,
      type: filter.type,
      walletId: filter.walletId,
      categoryId: filter.categoryId,
      search: filter.search,
      startDate: filter.startDate,
      endDate: filter.endDate,
      sort: filter.sort,
      page: filter.page,
      limit: filter.limit,
    });

    return {
      data: result.data,
      pagination: result.pagination,
    };
  }
}

export const transactionService = new TransactionService();