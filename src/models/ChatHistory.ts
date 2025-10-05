import mongoose, { Schema, Document, Model } from "mongoose";

interface IMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IChatHistory extends Document {
  tenantId: string;
  sessionId: string;
  messages: IMessage[];
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
  },
  { _id: false }
);

const ChatHistorySchema = new Schema<IChatHistory>(
  {
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
ChatHistorySchema.index({ tenantId: 1, sessionId: 1 });

const ChatHistory: Model<IChatHistory> =
  mongoose.models.ChatHistory ||
  mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);

export default ChatHistory;
