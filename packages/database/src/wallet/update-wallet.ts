import { prisma } from "../client";

export type UpdateWalletInput = {
  walletId: string;
  userId: string;
  name?: string;
};

export async function updateWallet(input: UpdateWalletInput) {
  const wallet = await prisma.wallet.findFirst({
    where: { id: input.walletId, userId: input.userId },
  });

  if (!wallet) {
    throw new Error("Wallet tidak ditemukan");
  }

  // Cek duplikasi nama
  if (input.name && input.name !== wallet.name) {
    const existing = await prisma.wallet.findFirst({
      where: {
        userId: input.userId,
        name: input.name,
        NOT: { id: input.walletId },
      },
    });

    if (existing) {
      throw new Error(`Wallet "${input.name}" sudah ada`);
    }
  }

  return prisma.wallet.update({
    where: { id: input.walletId },
    data: {
      ...(input.name && { name: input.name }),
    },
  });
}