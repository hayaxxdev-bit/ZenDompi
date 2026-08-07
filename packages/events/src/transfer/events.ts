import type { IEvent } from "../bus";

export const TransferEvents = {
  COMPLETED: "TransferCompleted",
  FAILED: "TransferFailed",
} as const;

export type TransferCompletedPayload = {
  transferId: string;
  userId: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description: string | null;
};

export type TransferFailedPayload = {
  userId: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  reason: string;
};

export class TransferCompletedEvent implements IEvent<TransferCompletedPayload> {
  readonly eventName = TransferEvents.COMPLETED;
  readonly timestamp = new Date();
  constructor(readonly payload: TransferCompletedPayload) {}
}

export class TransferFailedEvent implements IEvent<TransferFailedPayload> {
  readonly eventName = TransferEvents.FAILED;
  readonly timestamp = new Date();
  constructor(readonly payload: TransferFailedPayload) {}
}