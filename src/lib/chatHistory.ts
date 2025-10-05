// ============================================
// lib/chatHistory.ts - Chat Persistence
// ============================================
import { connectDB } from './mongoose';
import ChatHistory, { IChatHistory } from '@/models/ChatHistory';
import ChatSession from '@/models/ChatSession';

export async function saveChatMessage(
  userId: string,
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  tokens?: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  }
) {
  await connectDB();

  const messageData: any = {
    role,
    content,
    timestamp: new Date(),
  };

  // Add tokens only if provided
  if (tokens) {
    messageData.tokens = tokens;
  }

  const chat = await ChatHistory.findOneAndUpdate(
    { userId, sessionId },
    {
      $push: {
        messages: messageData,
      },
    },
    { upsert: true, new: true }
  );

  // Update or create session metadata
  if (role === 'user') {
    await upsertChatSession(userId, sessionId, content);
  } else {
    // Just update the lastMessageAt for assistant messages
    await ChatSession.findOneAndUpdate(
      { sessionId },
      { lastMessageAt: new Date() }
    );
  }

  return chat;
}

/**
 * Create or update a chat session
 */
export async function upsertChatSession(
  userId: string,
  sessionId: string,
  lastMessage: string
) {
  await connectDB();

  const existingSession = await ChatSession.findOne({ sessionId });

  if (existingSession) {
    // Update existing session
    existingSession.lastMessageAt = new Date();
    await existingSession.save();
  } else {
    // Create new session with title from first message
    const title = lastMessage.slice(0, 50) + (lastMessage.length > 50 ? "..." : "");
    await ChatSession.create({
      sessionId,
      userId,
      title,
      lastMessageAt: new Date(),
    });
  }
}

export async function getChatHistory(
  userId: string,
  sessionId: string
): Promise<IChatHistory | null> {
  await connectDB();
  const chat = await ChatHistory.findOne({ userId, sessionId }).lean();
  return chat as IChatHistory | null;
}

export async function getAllChatsForUser(userId: string) {
  await connectDB();
  const chats = await ChatHistory.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(100)
    .lean();
  return chats;
}

export async function getUserChatSessions(userId: string) {
  await connectDB();

  const sessions = await ChatSession.find({ userId })
    .sort({ lastMessageAt: -1 })
    .limit(50)
    .lean();

  return sessions;
}
