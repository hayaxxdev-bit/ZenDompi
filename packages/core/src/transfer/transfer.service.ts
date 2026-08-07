import { transferBetweenWallets as dbTransfer } from "@zendompi/database";
import { CoreError, InsufficientBalanceError } from "../errors";

export type TransferCommand = {
  userId: string;
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description?: string;
  date?: Date;
};

export class TransferService {
  async execute(cmd: TransferCommand) {
    // 1. Validasi
    if (!cmd.userId) throw new CoreError("User ID diperlukan", "MISSING_USER_ID", 400);
    if (!cmd.fromWalletId || !cmd.toWalletId) {
      throw new CoreError("Wallet sumber dan tujuan diperlukan", "MISSING_WALLET", 400);
    }
    if (cmd.fromWalletId === cmd.toWalletId) {
      throw new CoreError("Wallet sumber dan tujuan tidak boleh sama", "SAME_WALLET", 422);
    }
    if (typeof cmd.amount !== "number" || cmd.amount <= 0) {
      throw new CoreError("Jumlah transfer harus lebih besar dari 0", "INVALID_AMOUNT", 400);
    }

    // 2. Eksekusi
    try {
      const result = await dbTransfer({
        userId: cmd.userId,
        fromWalletId: cmd.fromWalletId,
        toWalletId: cmd.toWalletId,
        amount: cmd.amount,
        description: cmd.description,
        date: cmd.date,
      });

      return {
        transfer: {
          id: result.transfer.id,
          fromWalletId: result.transfer.fromWalletId,
          toWalletId: result.transfer.toWalletId,
          amount: result.transfer.amount.toNumber(),
          description: result.transfer.description,
        },
        transaction: {
          id: result.transaction.id,
          amount: result.transaction.amount.toNumber(),
        },
      };
    } catch (error: any) {
      if (error.message?.includes("Saldo tidak cukup")) {
        throw new InsufficientBalanceError(0, cmd.amount);
      }
      throw error;
    }
  }
}

export const transferService = new TransferService();