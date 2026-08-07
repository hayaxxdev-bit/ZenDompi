// ─── Errors ─────────────────────────────────────
export {
  CoreError,
  InsufficientBalanceError,
  WalletNotFoundError,
  WalletArchivedError,
  DuplicateWalletError,
  MaxWalletsError,
} from "./errors";

// ─── Auth ───────────────────────────────────────
export {
  AuthService,
  authService,
  OTPService,
  otpService,
} from "./auth";
export type {
  LoginCommand,
  RegisterCommand,
  RequestOTPCommand,
  AuthResult,
} from "./auth";

// ─── Transaction ────────────────────────────────
export {
  TransactionService,
  transactionService,
} from "./transaction";
export type {
  CreateTransactionCommand,
  UpdateTransactionCommand,
  TransactionFilter,
  TransactionResult,
} from "./transaction";

// ─── Wallet ─────────────────────────────────────
export {
  WalletService,
  walletService,
} from "./wallet";
export type {
  CreateWalletCommand,
  UpdateWalletCommand,
  WalletResult,
} from "./wallet";

// ─── Transfer ───────────────────────────────────
export {
  TransferService,
  transferService,
} from "./transfer";
export type { TransferCommand } from "./transfer";

// ─── Dashboard ──────────────────────────────────
export {
  DashboardService,
  dashboardService,
} from "./dashboard";

// ─── Category ───────────────────────────────────
export {
  CategoryService,
  categoryService,
} from "./category";
export type {
  CreateCategoryCommand,
  UpdateCategoryCommand,
} from "./category";

// ─── Statistics ─────────────────────────────────
export {
  StatisticsService,
  statisticsService,
} from "./statistics";

// ─── Chat ───────────────────────────────────────
export {
  ChatService,
  chatService,
} from "./chat";
export type { SaveChatCommand, GetChatFilter } from "./chat";

// ─── Notification ───────────────────────────────
export {
  NotificationService,
  notificationService,
} from "./notification";
export type { NotificationChannel, NotificationPayload } from "./notification";