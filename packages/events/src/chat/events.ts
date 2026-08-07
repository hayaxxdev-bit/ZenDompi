import type { IEvent } from "../bus";

export const ChatEvents = {
  MESSAGE_RECEIVED: "MessageReceived",
  MESSAGE_PARSED: "MessageParsed",
} as const;

export type MessageReceivedPayload = {
  userId: string;
  platform: "telegram" | "whatsapp";
  chatId: string;
  content: string;
};

export type MessageParsedPayload = {
  userId: string;
  platform: string;
  content: string;
  parsedResult: {
    type: string;
    amount: number;
    description: string;
    fromWallet?: string;
    toWallet?: string;
    category?: string;
  };
};

export class MessageReceivedEvent implements IEvent<MessageReceivedPayload> {
  readonly eventName = ChatEvents.MESSAGE_RECEIVED;
  readonly timestamp = new Date();
  constructor(readonly payload: MessageReceivedPayload) {}
}

export class MessageParsedEvent implements IEvent<MessageParsedPayload> {
  readonly eventName = ChatEvents.MESSAGE_PARSED;
  readonly timestamp = new Date();
  constructor(readonly payload: MessageParsedPayload) {}
}