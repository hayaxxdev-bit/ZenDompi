import type { ExtractedTransaction } from "../types";

/**
 * Validasi hasil ekstraksi
 * @returns Array of error messages (kosong jika valid)
 */
export function validateExtractedTransaction(
  extracted: Partial<ExtractedTransaction>
): string[] {
  const errors: string[] = [];

  // Type
  if (!extracted.type || !["INCOME", "EXPENSE", "TRANSFER"].includes(extracted.type)) {
    errors.push("Tipe transaksi tidak valid atau tidak terdeteksi");
  }

  // Amount
  if (!extracted.amount || extracted.amount <= 0) {
    errors.push("Nominal transaksi tidak terdeteksi");
  }
  if (extracted.amount && extracted.amount > 999_999_999_999) {
    errors.push("Nominal transaksi terlalu besar");
  }

  // Transfer-specific
  if (extracted.type === "TRANSFER") {
    if (!extracted.fromWallet) {
      errors.push("Wallet sumber tidak terdeteksi untuk transfer");
    }
    if (!extracted.toWallet) {
      errors.push("Wallet tujuan tidak terdeteksi untuk transfer");
    }
    if (extracted.fromWallet === extracted.toWallet) {
      errors.push("Wallet sumber dan tujuan tidak boleh sama");
    }
  }

  // Confidence
  if (extracted.confidence !== undefined && extracted.confidence < 0.6) {
    errors.push("Tingkat keyakinan AI terlalu rendah");
  }

  return errors;
}