// ============================================
// lib/gemini.ts - Gemini AI Integration
// ============================================
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function streamGeminiResponse(
  prompt: string,
  systemInstruction: string,
  modelName: string = "gemini-2.5-pro",
  conversationHistory: ChatMessage[] = []
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-pro",
    systemInstruction,
  });

  // Build chat history for Gemini (converts 'assistant' to 'model')
  const history = conversationHistory.map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  // Start chat with history
  const chat = model.startChat({
    history,
  });

  const result = await chat.sendMessageStream(prompt);

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

/**
 * Summarizes conversation history for context preservation
 */
export async function summarizeConversation(
  messages: ChatMessage[],
  existingSummary?: string
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    systemInstruction: "You are a conversation summarizer. Create concise summaries that preserve key context, facts, and decisions.",
  });

  let prompt = "";

  if (existingSummary) {
    prompt = `Previous summary:\n${existingSummary}\n\nNew messages to add to summary:\n`;
  } else {
    prompt = "Summarize the following conversation, preserving key context, facts, and decisions:\n\n";
  }

  // Format messages for summarization
  messages.forEach((msg) => {
    prompt += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
  });

  prompt += "\nProvide a concise summary (2-3 paragraphs) that captures the essential context.";

  const result = await model.generateContent(prompt);
  return result.response.text();
}
