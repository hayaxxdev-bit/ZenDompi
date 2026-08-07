import {
  saveMessage as dbSaveMessage,
  getMessages as dbGetMessages,
} from "@zendompi/database";

// ─── Tipe Data Service ──────────────────────────

export type SaveChatCommand = {
  userId: string;
  platform: "telegram" | "whatsapp";
  chatId: string;
  direction: "incoming" | "outgoing";
  messageType?: "text" | "command" | "transaction";
  content: string; // 👈 Disesuaikan dengan schema
  metadata?: Record<string, any>; // 👈 Disesuaikan dengan schema
};

export type GetChatFilter = {
  userId?: string;
  platform?: "telegram" | "whatsapp";
  limit?: number;
  offset?: number;
};

// ─── Chat Service ───────────────────────────────

export class ChatService {
  async save(cmd: SaveChatCommand) {
    // Parameter ini sekarang akan cocok 100% dengan
    // SaveMessageInput yang ada di database layer
    return dbSaveMessage({
      userId: cmd.userId,
      platform: cmd.platform,
      chatId: cmd.chatId,
      direction: cmd.direction,
      messageType: cmd.messageType,
      content: cmd.content,
      metadata: cmd.metadata,
    });
  }

  async getHistory(filter: GetChatFilter) {
    return dbGetMessages({
      userId: filter.userId,
      platform: filter.platform,
      limit: filter.limit,
      offset: filter.offset,
    });
  }
}

export const chatService = new ChatService();