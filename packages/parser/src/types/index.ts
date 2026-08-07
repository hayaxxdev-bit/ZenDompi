/**
 * Hasil ekstraksi dari natural language
 */
export type ExtractedTransaction = {
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  description: string;
  wallet?: string | null;
  fromWallet?: string | null;
  toWallet?: string | null;
  category?: string | null;
  confidence: number; // 0-1, tingkat keyakinan AI
  rawInput: string;
};

/**
 * Hasil parsing tanpa AI (regex-based fallback)
 */
export type ParsedAmount = {
  value: number;
  rawText: string;
};

export type ParsedWallet = {
  name: string;
  canonicalName: string;
  rawText: string;
};

export type ParsedCategory = {
  name: string;
  confidence: number;
};