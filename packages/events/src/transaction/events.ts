import type { IEvent } from "../bus";

// ─── Event Names ────────────────────────────────
export const TransactionEvents = {
  CREATED: "TransactionCreated",
  UPDATED: "TransactionUpdated",
  DELETED: "TransactionDeleted",
} as const;

// ─── Payloads ───────────────────────────────────
export type TransactionCreatedPayload = {
  transactionId: string;
  userId: string;
  walletId: string;
  type: string; // "INCOME" | "EXPENSE" | "TRANSFER"
  amount: number;
  description: string | null;
  categoryId: string | null;
};

export type TransactionUpdatedPayload = {
  transactionId: string;
  userId: string;
  changes: {
    description?: string;
    categoryId?: string | null;
  };
};

export type TransactionDeletedPayload = {
  transactionId: string;
  userId: string;
  walletId: string;
  type: string;
  amount: number;
};

// ─── Event Classes ──────────────────────────────
export class TransactionCreatedEvent implements IEvent<TransactionCreatedPayload> {
  readonly eventName = TransactionEvents.CREATED;
  readonly timestamp = new Date();

  constructor(readonly payload: TransactionCreatedPayload) {}
}

export class TransactionUpdatedEvent implements IEvent<TransactionUpdatedPayload> {
  readonly eventName = TransactionEvents.UPDATED;
  readonly timestamp = new Date();

  constructor(readonly payload: TransactionUpdatedPayload) {}
}

export class TransactionDeletedEvent implements IEvent<TransactionDeletedPayload> {
  readonly eventName = TransactionEvents.DELETED;
  readonly timestamp = new Date();

  constructor(readonly payload: TransactionDeletedPayload) {}
}