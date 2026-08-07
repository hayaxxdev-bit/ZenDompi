import { prisma } from "../client";
import { TransactionType } from "@prisma/client";
import { updateWalletBalance } from "../balance/update-wallet-balance";

export type CreateTransactionInput = {
  userId: string;
  walletId: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  description?: string;
  categoryId?: string;
  date?: Date;
};

export async function createTransaction(input: CreateTransactionInput) {
  const {
    userId,
    walletId,
    type,
    amount,
    description = "",
    categoryId,
    date = new Date(),
  } = input;

  if (amount <= 0) throw new Error("Jumlah harus lebih besar dari 0");

  return prisma.$transaction(async (tx) => {
    // Validasi wallet
    const wallet = await tx.wallet.findFirst({
      where: { id: walletId, userId },
    });

    if (!wallet) throw new Error("Wallet tidak ditemukan");
    if (wallet.isArchived) throw new Error("Wallet diarsipkan");

    // Validasi saldo untuk expense
    if (type === "EXPENSE") {
      if (wallet.balance.toNumber() < amount) {
        throw new Error(
          `Saldo tidak cukup. Saldo: Rp ${wallet.balance.toNumber().toLocaleString()}`
        );
      }
    }

    // Buat transaksi
    const transaction = await tx.transaction.create({
      data: {
        userId,
        walletId,
        type: type as TransactionType,
        amount,
        description: description || `Transaksi ${type}`,
        categoryId: categoryId || null,
        date,
      },
    });

    // Update saldo wallet
    const balanceChange = type === "INCOME" ? amount : -amount;
    await tx.wallet.update({
      where: { id: walletId },
      data: { balance: { increment: balanceChange } },
    });

    return transaction;
  });
}