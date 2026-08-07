import 'dotenv/config'
import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

let modelInstance: GenerativeModel | null = null;

export function getAIModel(): GenerativeModel {
  if (modelInstance) return modelInstance;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  modelInstance = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", // Cepat & efisien
    generationConfig: {
      temperature: 0.1, // Low temperature untuk hasil konsisten
      maxOutputTokens: 500,
    },
  });

  return modelInstance;
}