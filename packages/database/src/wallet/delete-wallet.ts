import { prisma } from "../client";

export async function deleteWallet(walletId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, userId },
  });

  if (!wallet) throw new Error("Wallet tidak ditemukan");

  // Cek apakah wallet dipakai transaksi
  const txCount = await prisma.transaction.count({
    where: { walletId },
  });

  if (txCount > 0) {
    // Soft delete (archive)
    return prisma.wallet.update({
      where: { id: walletId },
      data: { isArchived: true },
    });
  }

  return prisma.wallet.delete({
    where: { id: walletId },
  });
}