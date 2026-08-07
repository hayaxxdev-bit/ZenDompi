import { prisma } from "../client";

export type UpdateCategoryInput = {
  categoryId: string;
  userId: string;
  name?: string;
  icon?: string;
};

export async function updateCategory(input: UpdateCategoryInput) {
  const category = await prisma.category.findFirst({
    where: { id: input.categoryId, userId: input.userId },
  });

  if (!category) throw new Error("Kategori tidak ditemukan");

  if (input.name && input.name !== category.name) {
    const existing = await prisma.category.findFirst({
      where: { userId: input.userId, name: input.name },
    });
    if (existing) throw new Error(`Kategori "${input.name}" sudah ada`);
  }

  return prisma.category.update({
    where: { id: input.categoryId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.icon !== undefined && { icon: input.icon }),
    },
  });
}