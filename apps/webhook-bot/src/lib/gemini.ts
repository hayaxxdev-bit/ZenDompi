import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Types ─────────────────────────────────────
export type ExtractedTransaction = {
  type: "income" | "expense" | "transfer";
  amount: number;
  fromWallet?: string; // Untuk transfer & expense
  toWallet?: string;   // Untuk transfer & income
  description: string;
  category?: string;   // AI akan coba tebak kategori
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
    model: "gemini-2.0-flash", // Cepat & efisien untuk ekstraksi
  });

  const prompt = `${SYSTEM_PROMPT}\n\nInput: "${userMessage}"`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Bersihkan response (kadang Gemini kasih markdown code block)
    let jsonStr = responseText.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.slice(7, -3).trim();
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.slice(3, -3).trim();
    }

    const parsed = JSON.parse(jsonStr) as ExtractedTransaction;

    // Validasi field wajib
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