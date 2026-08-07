import { prisma } from "../client";

export async function getUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      whatsappNo: true,
      telegramId: true,
      image: true,
      createdAt: true,
    },
  });
}

export async function getUserByTelegramId(telegramId: string) {
  return prisma.user.findUnique({
    where: { telegramId },
  });
}

export async function getUserBywhatsappNo(whatsappNo: string) {
  return prisma.user.findUnique({
    where: { whatsappNo },
  });
}