// ============================================
// lib/chatHistory.ts - Chat Persistence
// ============================================
import { connectDB } from './mongoose';
import ChatHistory, { IChatHistory } from '@/models/ChatHistory';

export async function saveChatMessage(
  tenantId: string,
  sessionId: string,
  role: 'user' | 'assistant',
  content: string
) {
  await connectDB();

  const chat = await ChatHistory.findOneAndUpdate(
    { tenantId, sessionId },
    {
      $push: {
        messages: {
          role,
          content,
          timestamp: new Date(),
        },
      },
    },
    { upsert: true, new: true }
  );

  return chat;
}

export async function getChatHistory(
  tenantId: string,
  sessionId: string
): Promise<IChatHistory | null> {
  await connectDB();
  const chat = await ChatHistory.findOne({ tenantId, sessionId }).lean();
  return chat as IChatHistory | null;
}

export async function getAllChatsForTenant(tenantId: string) {
  await connectDB();
  const chats = await ChatHistory.find({ tenantId })
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();
  return chats;
}
