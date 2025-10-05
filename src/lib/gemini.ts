// ============================================
// lib/gemini.ts - Gemini AI Integration
// ============================================
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function streamGeminiResponse(
  prompt: string,
  systemInstruction: string,
  modelName: string = 'gemini-1.5-flash'
) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
  });

  const result = await model.generateContentStream(prompt);

  return result.stream;
}

export async function getGeminiResponse(
  prompt: string,
  systemInstruction: string,
  modelName: string = 'gemini-1.5-flash'
) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}
