import type { IEvent } from "../bus";

export const WalletEvents = {
  CREATED: "WalletCreated",
  UPDATED: "WalletUpdated",
  ARCHIVED: "WalletArchived",
  DELETED: "WalletDeleted",
} as const;

export type WalletCreatedPayload = {
  walletId: string;
  userId: string;
  name: string;
  initialBalance: number;
};

export type WalletUpdatedPayload = {
  walletId: string;
  userId: string;
  changes: {
    name?: string;
  };
};

export type WalletArchivedPayload = {
  walletId: string;
  userId: string;
  name: string;
};

export type WalletDeletedPayload = {
  walletId: string;
  userId: string;
  name: string;
};

export class WalletCreatedEvent implements IEvent<WalletCreatedPayload> {
  readonly eventName = WalletEvents.CREATED;
  readonly timestamp = new Date();
  constructor(readonly payload: WalletCreatedPayload) {}
}

export class WalletUpdatedEvent implements IEvent<WalletUpdatedPayload> {
  readonly eventName = WalletEvents.UPDATED;
  readonly timestamp = new Date();
  constructor(readonly payload: WalletUpdatedPayload) {}
}

export class WalletArchivedEvent implements IEvent<WalletArchivedPayload> {
  readonly eventName = WalletEvents.ARCHIVED;
  readonly timestamp = new Date();
  constructor(readonly payload: WalletArchivedPayload) {}
}

export class WalletDeletedEvent implements IEvent<WalletDeletedPayload> {
  readonly eventName = WalletEvents.DELETED;
  readonly timestamp = new Date();
  constructor(readonly payload: WalletDeletedPayload) {}
}