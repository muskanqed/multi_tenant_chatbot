// ============================================
// lib/gemini.ts - Gemini AI Integration
// ============================================
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function streamGeminiResponse(
  prompt: string,
  systemInstruction: string,
  modelName: string = "gemini-2.5-pro"
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    systemInstruction,
  });

  const result = await model.generateContentStream(prompt);

  return result;
}

export async function getGeminiResponse(
  prompt: string,
  systemInstruction: string,
  modelName: string = "gemini-2.0-flash-exp"
) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}
