import mongoose, { Schema, Document, Model } from "mongoose";

interface IMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tokens?: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
}

export interface IChatHistory extends Document {
  userId: string;
  sessionId: string;
  messages: IMessage[];
  summary?: string; // Summary of older messages beyond the sliding window
  summarizedUpToIndex?: number; // Index up to which messages have been summarized
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    tokens: {
      type: {
        promptTokens: { type: Number, required: false },
        responseTokens: { type: Number, required: false },
        totalTokens: { type: Number, required: false },
      },
      required: false,
    },
  },
  { _id: false }
);

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [MessageSchema],
    summary: {
      type: String,
      required: false,
    },
    summarizedUpToIndex: {
      type: Number,
      required: false,
      default: -1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
ChatHistorySchema.index({ userId: 1, sessionId: 1 }, { unique: true });

const ChatHistory: Model<IChatHistory> =
  mongoose.models.ChatHistory ||
  mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);

export default ChatHistory;
