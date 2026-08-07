import { prisma } from "../client";
import { Prisma } from "@prisma/client";

export type SaveMessageInput = {
  userId: string;
  platform: "telegram" | "whatsapp";
  chatId: string;
  direction: "incoming" | "outgoing";
  messageType?: "text" | "command" | "transaction";
  content: string;
  // Memastikan metadata benar-benar menggunakan tipe JSON dari Prisma
  metadata?: Prisma.JsonObject; 
};

export async function saveMessage(input: SaveMessageInput) {
  return prisma.chatLog.create({
    data: {
      userId: input.userId,
      platform: input.platform,
      chatId: input.chatId,
      direction: input.direction,
      messageType: input.messageType || "text",
      content: input.content,
      // Fallback ke objek JSON kosong sejati jika undefined
      metadata: input.metadata ?? {}, 
    },
  });
}