import type { IncomingMessage } from "@zendompi/adapter-telegram/types";
import type { ExtractedTransaction } from "../types";
import { normalizeAmount, detectWallets, detectTransactionType } from "../normalizer";
import { validateExtractedTransaction } from "../validator";
import { aiService } from "@zendompi/ai";

/**
 * Ekstrak transaksi dari pesan natural language
 * 
 * Strategy:
 * 1. Regex-based extraction (cepat, no API call)
 * 2. Jika regex gagal → AI extraction (Gemini)
 */
export async function extractTransaction(
  message: IncomingMessage
): Promise<ExtractedTransaction | null> {
  // 1. Coba regex dulu (fallback)
  const regexResult = extractWithRegex(message.text);
  if (regexResult && regexResult.confidence > 0.8) {
    return regexResult;
  }

  // 2. AI extraction via @zendompi/ai
  try {
    const aiResult = await aiService.extractTransaction(message.text);
    if (aiResult) {
      return aiResult;
    }
  } catch (error) {
    console.error("[Parser] AI extraction failed:", error);
  }

  // 3. Return regex result meskipun confidence rendah
  return regexResult;
}

/**
 * Regex-based extraction (fallback, no AI)
 */
function extractWithRegex(text: string): ExtractedTransaction | null {
  const amount = normalizeAmount(text);
  if (!amount) return null;

  const type = detectTransactionType(text);
  if (!type) return null;

  const { fromWallet, toWallet } = detectWallets(text);

  const result: ExtractedTransaction = {
    type,
    amount,
    description: cleanDescription(text),
    category: detectCategory(text),
    wallet: type === "TRANSFER" ? null : (fromWallet || toWallet),
    fromWallet: type === "TRANSFER" ? fromWallet : null,
    toWallet: type === "TRANSFER" ? toWallet : null,
    confidence: 0.7,
    rawInput: text,
  };

  // Validasi
  const errors = validateExtractedTransaction(result);
  if (errors.length > 0) {
    return null;
  }

  return result;
}

/**
 * Bersihkan deskripsi
 */
function cleanDescription(text: string): string {
  // Hapus nominal, wallet names, keyword transfer
  let cleaned = text
    .replace(/\b\d+[.,]?\d*\s*(rb|ribu|jt|juta|k|m)?\b/gi, "")
    .replace(/\b(pake|pakai|dari|ke|via|topup|top up|isi|transfer|kirim)\b/gi, "")
    .trim();

  if (!cleaned) cleaned = text;
  return cleaned.slice(0, 50);
}

/**
 * Deteksi kategori dari keyword
 */
function detectCategory(text: string): string {
  const lower = text.toLowerCase();

  const categoryKeywords: Record<string, string[]> = {
    Makanan: ["makan", "minum", "ngopi", "bakso", "soto", "nasi", "ayam", "mie", "kopi", "sarapan", "siang", "malam"],
    Transport: ["bensin", "parkir", "naik", "ojek", "gojek", "grab", "taksi", "bus", "kereta"],
    Belanja: ["beli", "pulsa", "shopee", "tokopedia", "online", "belanja"],
    Hiburan: ["nonton", "cinema", "game", "konser", "bioskop"],
    Gaji: ["gaji", "salary"],
    Freelance: ["freelance", "proyek", "side job"],
    Bonus: ["bonus", "thr", "hadiah"],
    "Top Up": ["topup", "top up", "isi saldo", "deposit"],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }

  return "Lainnya";
}