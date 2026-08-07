import {
  createWallet as dbCreateWallet,
  updateWallet as dbUpdateWallet,
  archiveWallet as dbArchiveWallet,
  deleteWallet as dbDeleteWallet,
  getWallet as dbGetWallet,
  listWallets as dbListWallets,
} from "@zendompi/database";
import {
  DuplicateWalletError,
  MaxWalletsError,
  WalletNotFoundError,
  CoreError,
} from "../errors";
import { validateCreateWallet, validateUpdateWallet } from "./wallet.validator";
import type {
  CreateWalletCommand,
  UpdateWalletCommand,
  WalletResult,
} from "./wallet.types";

export class WalletService {
  async create(cmd: CreateWalletCommand): Promise<WalletResult> {
    // Validasi
    validateCreateWallet(cmd);

    try {
      const wallet = await dbCreateWallet({
        userId: cmd.userId,
        name: cmd.name.trim(),
        currency: cmd.currency,
        initialBalance: cmd.initialBalance,
      });

      return {
        id: wallet.id,
        name: wallet.name,
        balance: wallet.balance.toNumber(),
        currency: wallet.currency,
        isArchived: wallet.isArchived,
        percentage: 0,
        createdAt: wallet.createdAt.toISOString(),
      };
    } catch (error: any) {
      if (error.message?.includes("sudah ada")) {
        throw new DuplicateWalletError(cmd.name);
      }
      if (error.message?.includes("Maksimum")) {
        throw new MaxWalletsError(20);
      }
      throw error;
    }
  }

  async update(cmd: UpdateWalletCommand) {
    validateUpdateWallet(cmd);

    const wallet = await dbUpdateWallet({
      walletId: cmd.walletId,
      userId: cmd.userId,
      name: cmd.name?.trim(),
    });

    return {
      id: wallet.id,
      name: wallet.name,
    };
  }

  async archive(walletId: string, userId: string) {
    if (!walletId) throw new CoreError("Wallet ID diperlukan", "MISSING_WALLET_ID", 400);

    try {
      const result = await dbArchiveWallet(walletId, userId);
      return { id: result.id, isArchived: result.isArchived };
    } catch (error: any) {
      if (error.message?.includes("tidak ditemukan")) {
        throw new WalletNotFoundError(walletId);
      }
      if (error.message?.includes("masih memiliki saldo")) {
        throw new CoreError(
          "Pindahkan saldo terlebih dahulu sebelum mengarsipkan wallet.",
          "BALANCE_NOT_ZERO",
          422
        );
      }
      throw error;
    }
  }

  async delete(walletId: string, userId: string) {
    if (!walletId) throw new CoreError("Wallet ID diperlukan", "MISSING_WALLET_ID", 400);

    await dbDeleteWallet(walletId, userId);
    return { success: true };
  }

  async getById(walletId: string, userId: string) {
    if (!walletId) throw new CoreError("Wallet ID diperlukan", "MISSING_WALLET_ID", 400);

    const wallet = await dbGetWallet(walletId, userId);
    if (!wallet) throw new WalletNotFoundError(walletId);

    return wallet;
  }

  async list(userId: string, includeArchived = false) {
    if (!userId) throw new CoreError("User ID diperlukan", "MISSING_USER_ID", 400);

    const wallets = await dbListWallets(userId, includeArchived);

    return wallets.map((w) => ({
      id: w.id,
      name: w.name,
      balance: w.balance,
      currency: w.currency,
      isArchived: w.isArchived,
      percentage: w.percentage,
      type: w.currency,
      createdAt: w.createdAt.toISOString(),
    }));
  }
}

export const walletService = new WalletService();