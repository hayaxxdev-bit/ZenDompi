import { prisma } from "../client";
import { Prisma } from "@prisma/client";

export type CreateWalletInput = {
  userId: string;
  name: string;
  currency?: string;
  initialBalance?: number;
};

export async function createWallet(input: CreateWalletInput) {
  // Cek duplikasi nama
  const existing = await prisma.wallet.findFirst({
    where: {
      userId: input.userId,
      name: input.name,
    },
  });

  if (existing) {
    throw new Error(`Wallet "${input.name}" sudah ada`);
  }

  // Cek maksimum wallet (20)
  const count = await prisma.wallet.count({
    where: { userId: input.userId, isArchived: false },
  });

  if (count >= 20) {
    throw new Error("Maksimum 20 wallet aktif per user");
  }

  return prisma.wallet.create({
    data: {
      userId: input.userId,
      name: input.name,
      balance: input.initialBalance ?? 0,
      currency: input.currency ?? "IDR",
    },
  });
}