// ============================================
// lib/chatHistory.ts - Chat Persistence
// ============================================
import { connectDB } from './mongoose';
import ChatHistory, { IChatHistory } from '@/models/ChatHistory';
import ChatSession from '@/models/ChatSession';

export async function saveChatMessage(
  tenantId: string,
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  userId?: string
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

  // Update or create session metadata
  if (role === 'user') {
    await upsertChatSession(tenantId, sessionId, content, userId);
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
  tenantId: string,
  sessionId: string,
  lastMessage: string,
  userId?: string
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
      tenantId,
      userId,
      title,
      lastMessageAt: new Date(),
    });
  }
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

export async function getUserChatSessions(
  tenantId: string,
  userId?: string
) {
  await connectDB();

  const query: any = { tenantId };
  if (userId) {
    query.userId = userId;
  }

  const sessions = await ChatSession.find(query)
    .sort({ lastMessageAt: -1 })
    .limit(50)
    .lean();

  return sessions;
}
