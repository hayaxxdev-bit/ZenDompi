import { prisma } from "../client";

export async function deleteCategory(categoryId: string, userId: string) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });

  if (!category) throw new Error("Kategori tidak ditemukan");

  // Unlink dari transaksi
  await prisma.transaction.updateMany({
    where: { categoryId },
    data: { categoryId: null },
  });

  return prisma.category.delete({
    where: { id: categoryId },
  });
}