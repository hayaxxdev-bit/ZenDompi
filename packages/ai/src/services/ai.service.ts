import { getAIModel } from "../client";
import { buildTransactionPrompt } from "../prompts/transaction.prompt";
import type { ExtractedTransaction } from "@zendompi/parser";

export class AIService {
  /**
   * Ekstrak transaksi dari teks natural language menggunakan Gemini AI
   */
  async extractTransaction(userInput: string): Promise<ExtractedTransaction | null> {
    const model = getAIModel();
    const prompt = buildTransactionPrompt(userInput);

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Bersihkan response (kadang ada markdown code block)
      let jsonStr = responseText.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.slice(7, -3).trim();
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.slice(3, -3).trim();
      }

      const parsed = JSON.parse(jsonStr);

      // Validasi hasil
      if (!parsed.type || !parsed.amount) {
        console.warn("[AI] Invalid extraction result:", parsed);
        return null;
      }

      return {
        type: parsed.type.toUpperCase(),
        amount: parsed.amount,
        description: parsed.description || userInput.slice(0, 50),
        wallet: parsed.wallet || null,
        fromWallet: parsed.fromWallet || null,
        toWallet: parsed.toWallet || null,
        category: parsed.category || null,
        confidence: parsed.confidence || 0.5,
        rawInput: userInput,
      };
    } catch (error: any) {
      // Deteksi error 429 (Rate Limit) dari Gemini API
      if (error?.status === 429 || error?.message?.includes("429")) {
        console.warn("[AI] Terkena Rate Limit Gemini API!");
        throw new Error("RATE_LIMIT"); // Lempar error ini supaya ditangkap oleh handler
      }

      console.error("[AI] Gemini extraction error:", error);
      return null;
    }
  }

  /**
   * Retry wrapper — coba ekstraksi maksimal 3x
   */
  async extractWithRetry(userInput: string, maxRetries = 3): Promise<ExtractedTransaction | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.extractTransaction(userInput);
        if (result && result.confidence >= 0.5) {
          return result;
        }
        console.warn(`[AI] Retry ${attempt}/${maxRetries} - low confidence`);
      } catch (error: any) {
        // Jika errornya karena Rate Limit, JANGAN di-retry. Langsung lempar ke atas.
        if (error.message === "RATE_LIMIT") {
          throw error;
        }
        console.error(`[AI] Retry ${attempt}/${maxRetries} failed:`, error);
      }

      // Exponential backoff (diperpanjang sedikit untuk memberi nafas pada API)
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    return null;
  }
}

export const aiService = new AIService();