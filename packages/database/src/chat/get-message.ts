import { prisma } from "../client";

export type GetMessagesFilter = {
  userId?: string;
  platform?: "telegram" | "whatsapp";
  chatId?: string;
  messageType?: "text" | "command" | "transaction";
  limit?: number;
  offset?: number;
};

export async function getMessages(filter: GetMessagesFilter) {
  return prisma.chatLog.findMany({
    where: {
      ...(filter.userId && { userId: filter.userId }),
      ...(filter.platform && { platform: filter.platform }),
      ...(filter.chatId && { chatId: filter.chatId }),
      ...(filter.messageType && { messageType: filter.messageType }),
    },
    orderBy: { createdAt: "desc" },
    take: filter.limit || 50,
    skip: filter.offset || 0,
  });
}

export async function getMessageById(messageId: string) {
  return prisma.chatLog.findUnique({
    where: { id: messageId },
  });
}

export async function getRecentMessages(userId: string, limit = 10) {
  return prisma.chatLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}