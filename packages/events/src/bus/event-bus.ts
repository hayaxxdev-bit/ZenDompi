import type { IEvent, IEventBus, EventHandler, Subscription } from "./types";

/**
 * In-Memory Event Bus
 * 
 * Synchronous + fire-and-forget async.
 * Subscriber error tidak menghentikan subscriber lain.
 */
export class InMemoryEventBus implements IEventBus {
  private subscribers: Map<string, Subscription[]> = new Map();
  private idCounter = 0;

  /**
   * Publish event ke semua subscriber yang match
   */
  async publish<T extends IEvent>(event: T): Promise<void> {
    const subs = this.subscribers.get(event.eventName) || [];

    if (subs.length === 0) return;

    // Jalankan semua handler secara paralel
    // Error di satu handler tidak mengganggu yang lain
    const results = await Promise.allSettled(
      subs.map((sub) =>
        Promise.resolve(sub.handler(event)).catch((error) => {
          console.error(
            `[EventBus] Error in handler "${sub.id}" for event "${event.eventName}":`,
            error
          );
        })
      )
    );

    // Log failed handlers (optional)
    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.warn(
        `[EventBus] ${failures.length}/${subs.length} handlers failed for event "${event.eventName}"`
      );
    }
  }

  /**
   * Subscribe ke event
   * @returns Fungsi unsubscribe
   */
  subscribe<T extends IEvent>(
    eventName: string,
    handler: EventHandler<T>
  ): () => void {
    const id = `sub_${++this.idCounter}_${eventName}`;

    const subscription: Subscription = {
      eventName,
      handler,
      id,
    };

    const existing = this.subscribers.get(eventName) || [];
    existing.push(subscription);
    this.subscribers.set(eventName, existing);

    console.log(`[EventBus] Subscribed: ${id}`);

    // Return unsubscribe function
    return () => this.unsubscribe(id);
  }

  /**
   * Unsubscribe by subscription ID
   */
  unsubscribe(subscriptionId: string): void {
    for (const [eventName, subs] of this.subscribers) {
      const index = subs.findIndex((s) => s.id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
        if (subs.length === 0) {
          this.subscribers.delete(eventName);
        }
        console.log(`[EventBus] Unsubscribed: ${subscriptionId}`);
        return;
      }
    }
  }

  /**
   * Jumlah subscriber (global atau per event)
   */
  subscriberCount(eventName?: string): number {
    if (eventName) {
      return (this.subscribers.get(eventName) || []).length;
    }
    let total = 0;
    for (const subs of this.subscribers.values()) {
      total += subs.length;
    }
    return total;
  }

  /**
   * Hapus semua subscriber
   */
  clear(): void {
    this.subscribers.clear();
    this.idCounter = 0;
    console.log("[EventBus] All subscribers cleared");
  }
}

/**
 * Singleton instance
 */
export const eventBus = new InMemoryEventBus();