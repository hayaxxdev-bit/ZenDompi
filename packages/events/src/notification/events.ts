import type { IEvent } from "../bus";

export const NotificationEvents = {
  SEND: "NotificationSend",
} as const;

export type NotificationSendPayload = {
  userId: string;
  channel: "telegram" | "whatsapp" | "EMAIL" | "PUSH";
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export class NotificationSendEvent implements IEvent<NotificationSendPayload> {
  readonly eventName = NotificationEvents.SEND;
  readonly timestamp = new Date();
  constructor(readonly payload: NotificationSendPayload) {}
}