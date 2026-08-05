import { prisma } from "./client.js";
import type { Transaction, LedgerEntry } from "@prisma/client";

export type SingleEntryInput = {
  userId: string;
  walletId: string;
  type: "income" | "expense";
  amount: number;
  description?: string;
  categoryId?: string;
  transactionDate?: Date;
};

export type SingleEntryResult = {
  transaction: Transaction;
  entry: LedgerEntry;
};

/**
 * Mencatat pemasukan (income) atau pengeluaran (expense) pada satu wallet.
 * 
 * Income  → LedgerEntry DEBIT (uang masuk)
 * Expense → LedgerEntry CREDIT (uang keluar)
 */
export async function createTransaction(
  input: SingleEntryInput
): Promise<SingleEntryResult> {
  const {
    userId,
    walletId,
    type,
    amount,
    description = "",
    categoryId,
    transactionDate = new Date(),
  } = input;

  if (amount <= 0) {
    throw new Error("Jumlah harus lebih besar dari 0");
  }

  return prisma.$transaction(async (tx) => {
    // Validasi wallet
    const wallet = await tx.wallet.findUniqueOrThrow({
      where: { id: walletId },
    });

    if (wallet.userId !== userId) {
      throw new Error("Anda tidak memiliki akses ke wallet ini");
    }

    if (wallet.isArchived) {
      throw new Error(`Wallet "${wallet.name}" sedang diarsipkan`);
    }

    // Untuk expense, validasi saldo
    if (type === "expense") {
      const breakdown = await tx.ledgerEntry.groupBy({
        by: ["accountType"],
        where: { walletId },
        _sum: { amount: true },
      });

      const debitSum =
        breakdown
          .find((b) => b.accountType === "debit")
          ?._sum.amount?.toNumber() ?? 0;
      const creditSum =
        breakdown
          .find((b) => b.accountType === "credit")
          ?._sum.amount?.toNumber() ?? 0;

      const balance =
        wallet.initialBalance.toNumber() + debitSum - creditSum;

      if (balance < amount) {
        throw new Error(
          `Saldo tidak mencukupi. Saldo: ${balance}, dibutuhkan: ${amount}`
        );
      }
    }

    // Buat transaction
    const transaction = await tx.transaction.create({
      data: {
        userId,
        categoryId: categoryId ?? null,
        type,
        description: description || `Transaksi ${type}`,
        totalAmount: amount,
        transactionDate,
      },
    });

    // Buat ledger entry
    const entry = await tx.ledgerEntry.create({
      data: {
        transactionId: transaction.id,
        walletId,
        accountType: type === "income" ? "debit" : "credit",
        amount,
      },
    });

    return { transaction, entry };
  });
}