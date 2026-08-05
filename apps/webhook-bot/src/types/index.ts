/**
 * Shared TypeScript types untuk Webhook Bot
 */

export interface WebhookPayload {
  platform: "telegram" | "whatsapp";
  chatId: string | number;
  message: string;
  userName: string;
}

export interface ProcessResult {
  success: boolean;
  message: string;
  transaction?: {
    id: string;
    type: string;
    amount: number;
  };
}

export interface BotResponse {
  text: string;
  parseMode?: "HTML" | "Markdown";
}

export type Platform = "telegram" | "whatsapp";

export interface UserSession {
  userId: string;
  platform: Platform;
  chatId: string;
  lastInteraction: Date;
  state: "idle" | "awaiting_confirmation" | "awaiting_wallet_selection";
}