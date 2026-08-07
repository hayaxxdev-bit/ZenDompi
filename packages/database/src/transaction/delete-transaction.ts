import { prisma } from "../client";

export async function deleteTransaction(transactionId: string, userId: string) {
  const tx = await prisma.transaction.findFirst({
    where: { id: transactionId, userId },
  });

  if (!tx) throw new Error("Transaksi tidak ditemukan");

  return prisma.$transaction(async (prismaTx) => {
    // Kembalikan saldo wallet
    const balanceChange =
      tx.type === "INCOME" ? -tx.amount.toNumber() : tx.amount.toNumber();

    await prismaTx.wallet.update({
      where: { id: tx.walletId },
      data: { balance: { increment: balanceChange } },
    });

    // Hapus transaksi
    await prismaTx.transaction.delete({
      where: { id: transactionId },
    });
  });
}