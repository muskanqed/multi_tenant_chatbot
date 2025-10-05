// ============================================
// models/ChatSession.ts - Chat Session Model
// ============================================
import mongoose, { Document, Schema } from "mongoose";

export interface IChatSession extends Document {
  sessionId: string;
  userId: string;
  title: string;
  lastMessageAt: Date;
  createdAt: Date;
}

const ChatSessionSchema = new Schema<IChatSession>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: "New Chat",
    },
    lastMessageAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying
ChatSessionSchema.index({ userId: 1, lastMessageAt: -1 });

const ChatSession =
  mongoose.models.ChatSession ||
  mongoose.model<IChatSession>("ChatSession", ChatSessionSchema);

export default ChatSession;
