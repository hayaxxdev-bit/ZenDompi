import { ZenDompiError } from "./base.error";

/**
 * Transfer error — spesifik untuk operasi transfer
 */
export class TransferError extends ZenDompiError {
  constructor(
    message: string,
    code:
      | "INSUFFICIENT_BALANCE"
      | "WALLET_NOT_FOUND"
      | "WALLET_ARCHIVED"
      | "SAME_WALLET"
      | "INVALID_AMOUNT"
      | "UNAUTHORIZED",
    details?: unknown
  ) {
    const statusCodes: Record<string, number> = {
      INSUFFICIENT_BALANCE: 422,
      WALLET_NOT_FOUND: 404,
      WALLET_ARCHIVED: 422,
      SAME_WALLET: 422,
      INVALID_AMOUNT: 400,
      UNAUTHORIZED: 403,
    };

    super(message, code, statusCodes[code] || 500, details);
    this.name = "TransferError";
  }
}