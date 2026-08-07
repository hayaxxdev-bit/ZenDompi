export type CreateWalletCommand = {
  userId: string;
  name: string;
  currency?: string;
  initialBalance?: number;
};

export type UpdateWalletCommand = {
  walletId: string;
  userId: string;
  name?: string;
};

export type WalletResult = {
  id: string;
  name: string;
  balance: number;
  currency: string;
  isArchived: boolean;
  percentage: number;
  createdAt: string;
};