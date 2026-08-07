import { prisma } from "../client";
import { TransactionType } from "@prisma/client";

export type CreateCategoryInput = {
  userId: string;
  name: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  icon?: string;
};

export async function createCategory(input: CreateCategoryInput) {
  const existing = await prisma.category.findFirst({
    where: { userId: input.userId, name: input.name },
  });

  if (existing) throw new Error(`Kategori "${input.name}" sudah ada`);

  return prisma.category.create({
    data: {
      userId: input.userId,
      name: input.name,
      type: input.type as TransactionType,
      icon: input.icon || null,
    },
  });
}