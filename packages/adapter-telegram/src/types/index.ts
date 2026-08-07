/**
 * Incoming message yang sudah dinormalisasi
 * Tidak bergantung pada format Telegram/WhatsApp spesifik
 */
export type IncomingMessage = {
  platform: "telegram" | "whatsapp";
  userId: string;
  chatId: string;
  username: string;
  text: string;
  timestamp: Date;
  content?: unknown; // Raw Grammy context (untuk fallback)
};

/**
 * Outgoing message template
 */
export type OutgoingMessage = {
  chatId: string;
  text: string;
  parseMode?: "HTML" | "Markdown";
  keyboard?: InlineKeyboard;
};

/**
 * Inline keyboard
 */
export type InlineKeyboard = {
  rows: InlineKeyboardButton[][];
};

export type InlineKeyboardButton = {
  text: string;
  callbackData?: string;
  url?: string;
};