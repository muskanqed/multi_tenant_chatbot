import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITenant extends Document {
  tenantId: string;
  name: string;
  logoUrl: string;
  themeColor: string;
  welcomeMessage: string;
  aiPersona: string;
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    tenantId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      required: true,
      default: "https://via.placeholder.com/150",
    },
    themeColor: {
      type: String,
      required: true,
      default: "#3b82f6",
    },
    welcomeMessage: {
      type: String,
      required: true,
      default: "Hello! How can I help you today?",
    },
    aiPersona: {
      type: String,
      required: true,
      default: "You are a helpful AI assistant.",
    },
    model: {
      type: String,
      required: true,
      default: "gemini-1.5-flash",
    },
  },
  {
    timestamps: true,
  }
);

const Tenant: Model<ITenant> =
  mongoose.models.Tenant || mongoose.model<ITenant>("Tenant", TenantSchema);

export default Tenant;
