import { prisma } from "../client";
import { TransactionType, Role } from "@prisma/client";

export type CreateUserInput = {
  name?: string;
  email?: string;
  telegramId?: string;
  whatsappNo?: string;
};

export async function createUser(input: CreateUserInput) {
  // Cek duplikasi
  if (input.email) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new Error("Email sudah terdaftar");
  }
  if (input.telegramId) {
    const existing = await prisma.user.findUnique({ where: { telegramId: input.telegramId } });
    if (existing) throw new Error("Telegram ID sudah terhubung ke akun lain");
  }
  if (input.whatsappNo) {
    const existing = await prisma.user.findUnique({ where: { whatsappNo: input.whatsappNo } });
    if (existing) throw new Error("Nomor WhatsApp sudah terdaftar");
  }

  return prisma.$transaction(async (tx) => {
    // Buat user
    const user = await tx.user.create({
      data: {
        name: input.name || "User",
        email: input.email || null,
        telegramId: input.telegramId || null,
        whatsappNo: input.whatsappNo || null,
        role: Role.USER,
      },
    });

    // Buat wallet default
    await tx.wallet.create({
      data: {
        userId: user.id,
        name: "Cash",
        balance: 0,
      },
    });

    // Buat kategori default
    const defaultCategories = [
      { name: "Makanan", type: TransactionType.EXPENSE, icon: "🍔" },
      { name: "Transport", type: TransactionType.EXPENSE, icon: "🚗" },
      { name: "Belanja", type: TransactionType.EXPENSE, icon: "🛍️" },
      { name: "Hiburan", type: TransactionType.EXPENSE, icon: "🎮" },
      { name: "Kesehatan", type: TransactionType.EXPENSE, icon: "💊" },
      { name: "Pendidikan", type: TransactionType.EXPENSE, icon: "📚" },
      { name: "Tagihan", type: TransactionType.EXPENSE, icon: "🧾" },
      { name: "Gaji", type: TransactionType.INCOME, icon: "💼" },
      { name: "Freelance", type: TransactionType.INCOME, icon: "💻" },
      { name: "Investasi", type: TransactionType.INCOME, icon: "📈" },
      { name: "Top Up", type: TransactionType.TRANSFER, icon: "🔄" },
      { name: "Lainnya", type: TransactionType.EXPENSE, icon: "📌" },
    ];

    await tx.category.createMany({
      data: defaultCategories.map((c) => ({
        userId: user.id,
        ...c,
      })),
    });

    return user;
  });
}