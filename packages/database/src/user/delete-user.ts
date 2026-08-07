import { prisma } from "../client";

/**
 * Hapus user dan semua data terkait
 * 
 * WARNING: Ini adalah operasi destruktif.
 * Pastikan ada konfirmasi dari user sebelum memanggil fungsi ini.
 */
export async function deleteUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  // Prisma akan handle cascade delete jika sudah di-set di schema
  return prisma.user.delete({
    where: { id: userId },
  });
}

/**
 * Soft delete: tandai user sebagai dihapus tanpa menghapus data
 * (Perlu menambah field deletedAt di schema)
 */
export async function deactivateUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  // Untuk sekarang update name jadi "[Dihapus]"
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: "[Dihapus]",
      email: null,
      whatsappNo: null,
      telegramId: null,
      image: null,
    },
  });
}