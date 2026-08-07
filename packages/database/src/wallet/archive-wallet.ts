import { prisma } from "../client";

export async function archiveWallet(walletId: string, userId: string) {
  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, userId },
  });

  if (!wallet) throw new Error("Wallet tidak ditemukan");
  if (wallet.isArchived) throw new Error("Wallet sudah diarsipkan");

  // Cek saldo nol
  if (wallet.balance.toNumber() !== 0) {
    throw new Error(
      `Wallet masih memiliki saldo. Pindahkan saldo terlebih dahulu sebelum mengarsipkan.`
    );
  }

  return prisma.wallet.update({
    where: { id: walletId },
    data: { isArchived: true },
  });
}