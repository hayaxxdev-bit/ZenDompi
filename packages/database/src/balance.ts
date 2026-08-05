import { prisma } from "./client.js";
import type { Prisma } from "@prisma/client";

/**
 * Menghitung saldo real-time sebuah wallet dari LedgerEntry.
 * 
 * Rumus:
 * SUM(debit) - SUM(credit) + initial_balance
 * 
 * Debit  = Uang masuk (income, transfer-in)
 * Credit = Uang keluar (expense, transfer-out)
 */
export async function getWalletBalance(walletId: string): Promise<number> {
  const result = await prisma.ledgerEntry.aggregate({
    where: { walletId },
    _sum: {
      amount: true,
    },
  });

  // Ambil juga initial_balance wallet
  const wallet = await prisma.wallet.findUniqueOrThrow({
    where: { id: walletId },
    select: { initialBalance: true },
  });

  // Karena kita butuh SUM debit dan SUM credit terpisah,
  // kita query ulang dengan groupBy
  const breakdown = await prisma.ledgerEntry.groupBy({
    by: ["accountType"],
    where: { walletId },
    _sum: { amount: true },
  });

  const debitSum =
    breakdown.find((b) => b.accountType === "debit")?._sum.amount?.toNumber() ?? 0;
  const creditSum =
    breakdown.find((b) => b.accountType === "credit")?._sum.amount?.toNumber() ?? 0;

  const initialBalance = wallet.initialBalance.toNumber();

  // Balance = Initial + Total Debit - Total Credit
  return initialBalance + debitSum - creditSum;
}

/**
 * Menghitung Net Worth (kekayaan bersih) seorang user
 * = Total saldo semua wallet aktif
 */
export async function getNetWorth(userId: string): Promise<number> {
  const wallets = await prisma.wallet.findMany({
    where: {
      userId,
      isArchived: false,
    },
    select: { id: true },
  });

  let netWorth = 0;

  for (const wallet of wallets) {
    const balance = await getWalletBalance(wallet.id);
    netWorth += balance;
  }

  return netWorth;
}

/**
 * Validasi apakah saldo wallet mencukupi untuk transaksi keluar
 */
export async function hasSufficientBalance(
  walletId: string,
  amount: number
): Promise<boolean> {
  const balance = await getWalletBalance(walletId);
  return balance >= amount;
}