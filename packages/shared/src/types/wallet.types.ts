import type { ID, Timestamp } from "./common.types";
import type { WalletType, Currency } from "../enums";

/**
 * Wallet/dompet
 */
export type Wallet = {
  id: ID;
  userId: ID;
  name: string;
  type: WalletType;
  currency: Currency;
  initialBalance: number;
  isArchived: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/**
 * Wallet dengan saldo kalkulasi
 */
export type WalletWithBalance = Wallet & {
  balance: number;
  percentage?: number; // Persentase dari total net worth
};

/**
 * Input untuk membuat wallet
 */
export type CreateWalletInput = {
  name: string;
  type: WalletType;
  initialBalance?: number;
  currency?: Currency;
};

/**
 * Input untuk update wallet
 */
export type UpdateWalletInput = {
  name?: string;
  isArchived?: boolean;
};