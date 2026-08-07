import { prisma } from "../client";
import { TransactionType } from "@prisma/client";

export async function listCategories(
  userId: string,
  type?: "INCOME" | "EXPENSE" | "TRANSFER"
) {
  return prisma.category.findMany({
    where: {
      userId,
      ...(type && { type: type as TransactionType }),
    },
    orderBy: { name: "asc" },
  });
}