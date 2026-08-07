// ─── Bus ────────────────────────────────────────
export {
  InMemoryEventBus,
  eventBus,
} from "./bus";
export type {
  IEvent,
  IEventBus,
  EventHandler,
  Subscription,
} from "./bus";

// ─── Transaction Events ─────────────────────────
export {
  TransactionEvents,
  TransactionCreatedEvent,
  TransactionUpdatedEvent,
  TransactionDeletedEvent,
} from "./transaction";
export type {
  TransactionCreatedPayload,
  TransactionUpdatedPayload,
  TransactionDeletedPayload,
} from "./transaction";

// ─── Wallet Events ──────────────────────────────
export {
  WalletEvents,
  WalletCreatedEvent,
  WalletUpdatedEvent,
  WalletArchivedEvent,
  WalletDeletedEvent,
} from "./wallet";
export type {
  WalletCreatedPayload,
  WalletUpdatedPayload,
  WalletArchivedPayload,
  WalletDeletedPayload,
} from "./wallet";

// ─── Transfer Events ────────────────────────────
export {
  TransferEvents,
  TransferCompletedEvent,
  TransferFailedEvent,
} from "./transfer";
export type {
  TransferCompletedPayload,
  TransferFailedPayload,
} from "./transfer";

// ─── Category Events ────────────────────────────
export {
  CategoryEvents,
  CategoryCreatedEvent,
  CategoryUpdatedEvent,
  CategoryDeletedEvent,
} from "./category";
export type {
  CategoryCreatedPayload,
  CategoryUpdatedPayload,
  CategoryDeletedPayload,
} from "./category";

// ─── Auth Events ────────────────────────────────
export {
  AuthEvents,
  UserLoginEvent,
  UserRegisterEvent,
  UserLogoutEvent,
} from "./auth";
export type {
  UserLoginPayload,
  UserRegisterPayload,
  UserLogoutPayload,
} from "./auth";

// ─── Chat Events ────────────────────────────────
export {
  ChatEvents,
  MessageReceivedEvent,
  MessageParsedEvent,
} from "./chat";
export type {
  MessageReceivedPayload,
  MessageParsedPayload,
} from "./chat";

// ─── Notification Events ────────────────────────
export {
  NotificationEvents,
  NotificationSendEvent,
} from "./notification";
export type {
  NotificationSendPayload,
} from "./notification";