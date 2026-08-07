import type { ID } from "../types";
import type { WalletType, Currency } from "../enums";

/**
 * DTO untuk membuat wallet
 */
export type CreateWalletDTO = {
  name: string;
  type: WalletType;
  initialBalance?: number;
  currency?: Currency;
};

/**
 * DTO untuk response wallet
 */
export type WalletResponseDTO = {
  id: ID;
  name: string;
  type: string;
  currency: string;
  balance: number;
  percentage: number;
  createdAt: string;
};