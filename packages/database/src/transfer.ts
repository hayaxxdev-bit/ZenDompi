import { prisma } from "./client.js";
import type { Prisma, Wallet, Transaction, LedgerEntry } from "@prisma/client";

// ─── Type Definitions ──────────────────────────

export type TransferResult = {
  transaction: Transaction;
  entries: [LedgerEntry, LedgerEntry]; // [source credit, destination debit]
};

export class TransferError extends Error {
  constructor(
    message: string,
    public code:
      | "INSUFFICIENT_BALANCE"
      | "WALLET_NOT_FOUND"
      | "WALLET_ARCHIVED"
      | "SAME_WALLET"
      | "INVALID_AMOUNT"
      | "UNAUTHORIZED"
  ) {
    super(message);
    this.name = "TransferError";
  }
}

// ─── Input Type ────────────────────────────────

export type TransferInput = {
  userId: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description?: string;
  categoryId?: string;
  transactionDate?: Date;
};

// ─── CORE TRANSFER FUNCTION ───────────────────

/**
 * Memindahkan uang antar wallet dalam satu transaksi ACID.
 * 
 * Double-Entry:
 * - Wallet sumber  → LedgerEntry CREDIT (uang keluar)
 * - Wallet tujuan  → LedgerEntry DEBIT  (uang masuk)
 * 
 * Dijamin: Jika salah satu gagal, semuanya rollback.
 */
export async function transferBetweenWallets(
  input: TransferInput
): Promise<TransferResult> {
  const {
    userId,
    fromWalletId,
    toWalletId,
    amount,
    description = "",
    categoryId,
    transactionDate = new Date(),
  } = input;

  // ─── Validasi Awal ──────────────────────────
  if (amount <= 0) {
    throw new TransferError(
      "Jumlah transfer harus lebih besar dari 0",
      "INVALID_AMOUNT"
    );
  }

  if (fromWalletId === toWalletId) {
    throw new TransferError(
      "Wallet sumber dan tujuan tidak boleh sama",
      "SAME_WALLET"
    );
  }

  // ─── TRANSACTION BLOCK ──────────────────────
  // Semua operasi di dalam $transaction dijamin atomik.
  // Jika ada error di dalamnya, semua perubahan akan di-ROLLBACK.
  return prisma.$transaction(async (tx): Promise<TransferResult> => {
    // 1. Ambil kedua wallet dan validasi kepemilikan
    const wallets = await tx.wallet.findMany({
      where: {
        id: { in: [fromWalletId, toWalletId] },
      },
    });

    const fromWallet = wallets.find((w) => w.id === fromWalletId);
    const toWallet = wallets.find((w) => w.id === toWalletId);

    if (!fromWallet) {
      throw new TransferError(
        "Wallet sumber tidak ditemukan",
        "WALLET_NOT_FOUND"
      );
    }

    if (!toWallet) {
      throw new TransferError(
        "Wallet tujuan tidak ditemukan",
        "WALLET_NOT_FOUND"
      );
    }

    // 2. Validasi kepemilikan wallet
    if (fromWallet.userId !== userId || toWallet.userId !== userId) {
      throw new TransferError(
        "Anda tidak memiliki akses ke wallet ini",
        "UNAUTHORIZED"
      );
    }

    // 3. Validasi wallet tidak di-archive
    if (fromWallet.isArchived) {
      throw new TransferError(
        `Wallet "${fromWallet.name}" sedang diarsipkan`,
        "WALLET_ARCHIVED"
      );
    }

    if (toWallet.isArchived) {
      throw new TransferError(
        `Wallet "${toWallet.name}" sedang diarsipkan`,
        "WALLET_ARCHIVED"
      );
    }

    // 4. Validasi saldo mencukupi (hitung dari ledger)
    const balanceBreakdown = await tx.ledgerEntry.groupBy({
      by: ["accountType"],
      where: { walletId: fromWalletId },
      _sum: { amount: true },
    });

    const debitSum =
      balanceBreakdown
        .find((b) => b.accountType === "debit")
        ?._sum.amount?.toNumber() ?? 0;
    const creditSum =
      balanceBreakdown
        .find((b) => b.accountType === "credit")
        ?._sum.amount?.toNumber() ?? 0;

    const currentBalance =
      fromWallet.initialBalance.toNumber() + debitSum - creditSum;

    if (currentBalance < amount) {
      throw new TransferError(
        `Saldo tidak mencukupi. Saldo saat ini: ${currentBalance}, dibutuhkan: ${amount}`,
        "INSUFFICIENT_BALANCE"
      );
    }

    // 5. Buat record Transaction
    const transaction = await tx.transaction.create({
      data: {
        userId,
        categoryId: categoryId ?? null,
        type: "transfer",
        description:
          description ||
          `Transfer dari ${fromWallet.name} ke ${toWallet.name}`,
        totalAmount: amount,
        transactionDate,
      },
    });

    // 6. Buat dua LedgerEntry (Double-Entry Bookkeeping)
    // Credit = uang KELUAR dari wallet sumber
    const creditEntry = await tx.ledgerEntry.create({
      data: {
        transactionId: transaction.id,
        walletId: fromWalletId,
        accountType: "credit",
        amount,
      },
    });

    // Debit = uang MASUK ke wallet tujuan
    const debitEntry = await tx.ledgerEntry.create({
      data: {
        transactionId: transaction.id,
        walletId: toWalletId,
        accountType: "debit",
        amount,
      },
    });

    return {
      transaction,
      entries: [creditEntry, debitEntry],
    };
  });
}