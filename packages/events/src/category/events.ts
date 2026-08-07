import type { IEvent } from "../bus";

export const CategoryEvents = {
  CREATED: "CategoryCreated",
  UPDATED: "CategoryUpdated",
  DELETED: "CategoryDeleted",
} as const;

export type CategoryCreatedPayload = {
  categoryId: string;
  userId: string;
  name: string;
  type: string;
};

export type CategoryUpdatedPayload = {
  categoryId: string;
  userId: string;
  changes: {
    name?: string;
    icon?: string;
  };
};

export type CategoryDeletedPayload = {
  categoryId: string;
  userId: string;
  name: string;
};

export class CategoryCreatedEvent implements IEvent<CategoryCreatedPayload> {
  readonly eventName = CategoryEvents.CREATED;
  readonly timestamp = new Date();
  constructor(readonly payload: CategoryCreatedPayload) {}
}

export class CategoryUpdatedEvent implements IEvent<CategoryUpdatedPayload> {
  readonly eventName = CategoryEvents.UPDATED;
  readonly timestamp = new Date();
  constructor(readonly payload: CategoryUpdatedPayload) {}
}

export class CategoryDeletedEvent implements IEvent<CategoryDeletedPayload> {
  readonly eventName = CategoryEvents.DELETED;
  readonly timestamp = new Date();
  constructor(readonly payload: CategoryDeletedPayload) {}
}