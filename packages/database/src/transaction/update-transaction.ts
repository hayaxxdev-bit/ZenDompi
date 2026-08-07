import { prisma } from "../client";

export type UpdateTransactionInput = {
  transactionId: string;
  userId: string;
  description?: string;
  categoryId?: string | null;
  date?: Date;
};

export async function updateTransaction(input: UpdateTransactionInput) {
  const tx = await prisma.transaction.findFirst({
    where: { id: input.transactionId, userId: input.userId },
  });

  if (!tx) throw new Error("Transaksi tidak ditemukan");

  return prisma.transaction.update({
    where: { id: input.transactionId },
    data: {
      ...(input.description !== undefined && { description: input.description }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      ...(input.date && { date: input.date }),
    },
  });
}