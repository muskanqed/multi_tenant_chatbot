import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITenant extends Document {
  tenantId: string;
  name: string;
  domain: string;
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
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      // validate: {
      //   validator: function(v: string) {
      //     // Allow localhost or proper domain format
      //     return /^(localhost|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9])$/.test(v);
      //   },
      //   message: 'Please enter a valid domain (e.g., example.com or localhost)',
      // },
    },
    logoUrl: {
      type: String,
      required: false,
      default: "",
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
      default: "gemini-2.0-flash-exp",
    },
  },
  {
    timestamps: true,
  }
);

const Tenant: Model<ITenant> =
  mongoose.models.Tenant || mongoose.model<ITenant>("Tenant", TenantSchema);

export default Tenant;
