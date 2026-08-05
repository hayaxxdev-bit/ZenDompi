import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Types ─────────────────────────────────────
export type ExtractedTransaction = {
  type: "income" | "expense" | "transfer";
  amount: number;
  fromWallet?: string | undefined; // Untuk transfer & expense
  toWallet?: string | undefined;   // Untuk transfer & income
  description: string | undefined;
  category?: string | undefined;   // AI akan coba tebak kategori
};

// ─── Constants ─────────────────────────────────
const SUFFIX_MULTIPLIERS: Record<string, number> = {
  k: 1_000,
  rb: 1_000,
  ribu: 1_000,
  jt: 1_000_000,
  juta: 1_000_000,
};

const WALLET_ALIASES: Record<string, string> = {
  bca: "BCA Tahapan",
  mandiri: "Mandiri",
  gopay: "GoPay",
  ovo: "OVO",
  cash: "Cash",
  tunai: "Cash",
  dana: "DANA",
  shopeepay: "ShopeePay",
};

// ─── Gemini Client ─────────────────────────────  
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `Kamu adalah asisten keuangan yang bertugas mengekstrak informasi transaksi dari chat kasual pengguna berbahasa Indonesia.

Output HARUS dalam format JSON. Tidak boleh ada teks lain selain JSON.

ATURAN EKSTRAKSI:
1. Tentukan "type": "income", "expense", atau "transfer"
2. Ekstrak "amount" dalam angka (bukan string), selalu dalam Rupiah
3. Untuk "transfer": tentukan "fromWallet" dan "toWallet"
4. Untuk "expense": tentukan "fromWallet" sebagai sumber uang
5. Untuk "income": tentukan "toWallet" sebagai tujuan uang
6. "description": ringkasan singkat transaksi
7. "category": tebak kategori (makanan, transport, belanja, hiburan, topup, dll)

NAMA WALLET YANG DIKENALI:
- BCA / bca → "BCA Tahapan"
- Mandiri / mandiri → "Mandiri"
- GoPay / gopay / go-pay → "GoPay"
- OVO / ovo → "OVO"
- Cash / cash / tunai → "Cash"
- DANA / dana → "DANA"
- ShopeePay / shopeepay → "ShopeePay"

CONTOH:

Input: "Top up ovo 50rb pake bca"
Output: {"type":"transfer","amount":50000,"fromWallet":"BCA Tahapan","toWallet":"OVO","description":"Top up OVO dari BCA","category":"topup"}

Input: "Makan siang di warteg 25 ribu bayar gopay"
Output: {"type":"expense","amount":25000,"fromWallet":"GoPay","description":"Makan siang di warteg","category":"makanan"}

Input: "Gajian 10 juta masuk mandiri"
Output: {"type":"income","amount":10000000,"toWallet":"Mandiri","description":"Gaji masuk Mandiri","category":"gaji"}

Input: "Beli pulsa 20k pake dana"
Output: {"type":"expense","amount":20000,"fromWallet":"DANA","description":"Beli pulsa","category":"belanja"}

SEKARANG EKSTRAK INPUT BERIKUT:`;

// ─── Main Extraction Function ──────────────────
export async function extractTransactionFromChat(
  userMessage: string
): Promise<ExtractedTransaction | null> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });

  const prompt = `${SYSTEM_PROMPT}\n\nInput: "${userMessage}"`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let jsonStr = responseText.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7, -3).trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3, -3).trim();
    }

    const parsed = JSON.parse(jsonStr) as ExtractedTransaction;

    if (!parsed.type || !parsed.amount || parsed.amount <= 0) {
      console.error("Invalid extraction result:", parsed);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Gemini extraction error:", error);
    return null;
  }
}

// ─── Regex-based Fallback ──────────────────────
/**
 * Fallback ekstraksi sederhana pakai regex
 * Digunakan jika Gemini API gagal atau timeout
 */
export function extractWithRegex(
  userMessage: string
): ExtractedTransaction | null {
  const lowerMessage = userMessage.toLowerCase();

  // Deteksi nominal
  let amount: number | null = null;

  // Coba pola "50rb", "100 ribu"
  const suffixMatch = lowerMessage.match(
    /(\d+[.,]?\d*)\s*(rb|ribu|jt|juta|k)\b/i
  );
  if (suffixMatch && suffixMatch[1] && suffixMatch[2]) {
    const num = parseFloat(suffixMatch[1].replace(",", "."));
    const suffix = suffixMatch[2].toLowerCase();
    const multiplier = SUFFIX_MULTIPLIERS[suffix] || 1;
    amount = Math.round(num * multiplier);
  }

  // Coba pola "50000", "50.000"
  if (!amount) {
    const numberMatch = lowerMessage.match(/\b(\d{3,})\b/);
    if (numberMatch && numberMatch[1]) {
      const numStr = numberMatch[1].replace(/\./g, "");
      amount = parseInt(numStr, 10);
    }
  }

  if (!amount || amount <= 0) return null;

  // Deteksi tipe transaksi
  const isTopUp = /\b(top\s*up|isi|isi saldo|deposit)\b/i.test(lowerMessage);
  const isTransfer = /\b(transfer|kirim|pindah|tf)\b/i.test(lowerMessage);
  const isExpense =
    /\b(bayar|beli|makan|minum|naik|bensin|parkir|langganan)\b/i.test(
      lowerMessage
    );
  const isIncome =
    /\b(gaji|dapat|terima|dikasih|bonus|freelance|proyek)\b/i.test(
      lowerMessage
    );

  // Deteksi wallet
  let fromWallet: string | undefined;
  let toWallet: string | undefined;

  for (const [alias, walletName] of Object.entries(WALLET_ALIASES)) {
    const regex = new RegExp(
      `\\b(pake|dari|via)\\s+${alias}\\b|\\b${alias}\\b.*\\b(bayar|pake|transfer)\\b`,
      "i"
    );
    if (regex.test(lowerMessage)) {
      fromWallet = walletName;
      break;
    }
  }

  for (const [alias, walletName] of Object.entries(WALLET_ALIASES)) {
    const regex = new RegExp(
      `\\b(ke|topup|isi|top up|masuk)\\s+${alias}\\b`,
      "i"
    );
    if (regex.test(lowerMessage)) {
      toWallet = walletName;
      break;
    }
  }

  // Tentukan type
  let type: "income" | "expense" | "transfer";
  if (isTopUp || isTransfer || (fromWallet && toWallet)) {
    type = "transfer";
  } else if (isIncome) {
    type = "income";
  } else {
    type = "expense";
  }

  return {
    type,
    amount,
    fromWallet,
    toWallet,
    description: userMessage,
    category: type === "transfer" ? "topup" : "lainnya",
  };
}