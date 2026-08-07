/**
 * Base Event interface
 * Semua event harus implement ini
 */
export interface IEvent<P = unknown> {
  /** Nama event (unik) — contoh: "TransactionCreated" */
  readonly eventName: string;

  /** Timestamp event dibuat */
  readonly timestamp: Date;

  /** Payload event (immutable) */
  readonly payload: P;
}

/**
 * Event handler / subscriber
 * Dipanggil saat event terjadi
 */
export type EventHandler<T extends IEvent = IEvent> = (event: T) => void | Promise<void>;

/**
 * Subscription entry
 */
export type Subscription = {
  eventName: string;
  handler: EventHandler<any>;
  id: string;
};

/**
 * Interface Event Bus
 * Abstraksi agar implementasi bisa diganti
 */
export interface IEventBus {
  /** Publish event ke semua subscriber */
  publish<T extends IEvent>(event: T): Promise<void>;

  /** Subscribe ke event tertentu */
  subscribe<T extends IEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): () => void; // Return unsubscribe function

  /** Unsubscribe */
  unsubscribe(subscriptionId: string): void;

  /** Jumlah subscriber */
  subscriberCount(eventName?: string): number;

  /** Clear semua subscriber */
  clear(): void;
}