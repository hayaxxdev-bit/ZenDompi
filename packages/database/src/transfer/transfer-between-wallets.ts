import { prisma } from "../client";
import { TransactionType } from "@prisma/client";

export type TransferInput = {
  userId: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description?: string;
  date?: Date;
};

export async function transferBetweenWallets(input: TransferInput) {
  const {
    userId,
    fromWalletId,
    toWalletId,
    amount,
    description = "",
    date = new Date(),
  } = input;

  if (amount <= 0) throw new Error("Jumlah transfer harus lebih besar dari 0");
  if (fromWalletId === toWalletId) throw new Error("Wallet sumber dan tujuan tidak boleh sama");

  return prisma.$transaction(async (tx) => {
    // Validasi wallet
    const [fromWallet, toWallet] = await Promise.all([
      tx.wallet.findFirst({ where: { id: fromWalletId, userId } }),
      tx.wallet.findFirst({ where: { id: toWalletId, userId } }),
    ]);

    if (!fromWallet) throw new Error("Wallet sumber tidak ditemukan");
    if (!toWallet) throw new Error("Wallet tujuan tidak ditemukan");
    if (fromWallet.isArchived) throw new Error(`Wallet "${fromWallet.name}" diarsipkan`);
    if (toWallet.isArchived) throw new Error(`Wallet "${toWallet.name}" diarsipkan`);

    // Validasi saldo
    if (fromWallet.balance.toNumber() < amount) {
      throw new Error(
        `Saldo tidak cukup. Saldo ${fromWallet.name}: Rp ${fromWallet.balance.toNumber().toLocaleString()}`
      );
    }

    // Buat record Transfer
    const transfer = await tx.transfer.create({
      data: {
        userId,
        fromWalletId,
        toWalletId,
        amount,
        description: description || `Transfer ${fromWallet.name} → ${toWallet.name}`,
        date,
      },
    });

    // Update saldo kedua wallet
    await tx.wallet.update({
      where: { id: fromWalletId },
      data: { balance: { decrement: amount } },
    });

    await tx.wallet.update({
      where: { id: toWalletId },
      data: { balance: { increment: amount } },
    });

    // Buat transaksi TRANSFER (opsional, untuk pencatatan)
    const transaction = await tx.transaction.create({
      data: {
        userId,
        walletId: fromWalletId,
        type: TransactionType.TRANSFER,
        amount,
        description: description || `Transfer ke ${toWallet.name}`,
        transferId: transfer.id,
        date,
      },
    });

    return { transfer, transaction };
  });
}