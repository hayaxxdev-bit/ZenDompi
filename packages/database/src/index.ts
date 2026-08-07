// ─── Client ─────────────────────────────────────
export { prisma } from "./client";

// ─── Prisma Types ───────────────────────────────
export * from "@prisma/client";

// ─── Balance ────────────────────────────────────
export {
  getWalletBalance,
  getNetWorth,
  hasSufficientBalance,
} from "./balance";

// ─── Wallet ─────────────────────────────────────
export {
  createWallet,
  updateWallet,
  archiveWallet,
  deleteWallet,
  getWallet,
  listWallets,
} from "./wallet";
export type { CreateWalletInput, UpdateWalletInput } from "./wallet";

// ─── Transaction ────────────────────────────────
export {
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransaction,
  listTransactions,
} from "./transaction";
export type {
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilter,
} from "./transaction";

// ─── Transfer ───────────────────────────────────
export { transferBetweenWallets } from "./transfer";
export type { TransferInput } from "./transfer";

// ─── Category ───────────────────────────────────
export {
  createCategory,
  updateCategory,
  deleteCategory,
  listCategories,
} from "./category";
export type { CreateCategoryInput, UpdateCategoryInput } from "./category";

// ─── Dashboard ──────────────────────────────────
export { getDashboard } from "./dashboard";

// ─── Statistics ─────────────────────────────────
export { getMonthlyStats, getYearlyStats, getCashflow } from "./statistics";
export type { MonthlyStatsInput, YearlyStatsInput, CashflowInput, CashflowData } from "./statistics";

// ─── User ───────────────────────────────────────
export {
  createUser,
  updateUser,
  getUser,
  getUserByTelegramId,
  getUserBywhatsappNo,
  deleteUser,
  deactivateUser,
} from "./user";
export type { CreateUserInput, UpdateUserInput } from "./user";

// ─── Chat ───────────────────────────────────────
export { saveMessage, getMessages, getMessageById, getRecentMessages } from "./chat";
export type { SaveMessageInput, GetMessagesFilter } from "./chat";