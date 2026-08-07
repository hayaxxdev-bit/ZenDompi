import { prisma } from "../client";

export type UpdateUserInput = {
  userId: string;
  name?: string | null;
  email?: string | null;
  whatsappNo?: string | null; // ✅ Sesuaikan dengan nama field di Prisma (whatsappNo)
  telegramId?: string | null; // ✅ Ubah ke string karena di Prisma tipe datanya String
  image?: string | null;
};

export async function updateUser(input: UpdateUserInput) {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
  });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  // Cek duplikasi email
  if (input.email && input.email !== user.email) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) throw new Error("Email sudah digunakan");
  }

  // ✅ Cek duplikasi whatsappNo
  if (input.whatsappNo && input.whatsappNo !== user.whatsappNo) {
    const existing = await prisma.user.findUnique({
      where: { whatsappNo: input.whatsappNo },
    });
    if (existing) throw new Error("Nomor WhatsApp sudah digunakan");
  }

  // ✅ Cek duplikasi telegramId (sekarang perbandingan murni string ke string)
  if (input.telegramId !== undefined && input.telegramId !== user.telegramId) {
    if (input.telegramId) {
      const existing = await prisma.user.findUnique({
        where: { telegramId: input.telegramId },
      });
      if (existing) throw new Error("Telegram ID sudah terhubung ke akun lain");
    }
  }

  // ✅ Simpan data ke database
  return prisma.user.update({
    where: { id: input.userId },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.email !== undefined && { email: input.email }),
      ...(input.whatsappNo !== undefined && { whatsappNo: input.whatsappNo }),
      ...(input.telegramId !== undefined && { telegramId: input.telegramId }),
      ...(input.image !== undefined && { image: input.image }),
    },
  });
}