import { prisma } from "../client";

export async function getTransaction(transactionId: string, userId: string) {
  return prisma.transaction.findFirst({
    where: { id: transactionId, userId },
    include: {
      wallet: {
        select: { id: true, name: true, currency: true },
      },
      category: {
        select: { id: true, name: true, icon: true },
      },
      transfer: {
        include: {
          fromWallet: { select: { id: true, name: true } },
          toWallet: { select: { id: true, name: true } },
        },
      },
    },
  });
}