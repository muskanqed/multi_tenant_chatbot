"use client";

import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface ThemePreviewProps {
  primaryColor: string;
  secondaryColor: string;
  tenantName?: string;
}

export default function ThemePreview({
  primaryColor,
  secondaryColor,
  tenantName = "Your Company",
}: ThemePreviewProps) {
  return (
    <Card className="p-6 w-full max-w-md">
      <h3 className="text-lg font-semibold mb-4">Theme Preview</h3>

      <div className="space-y-4">
        {/* Header Preview */}
        <div
          className="p-4 rounded-lg"
          style={{ borderTop: `4px solid ${primaryColor}` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: primaryColor }}
            >
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: primaryColor }}>
                {tenantName}
              </p>
              <p className="text-xs text-muted-foreground">AI Assistant</p>
            </div>
          </div>
        </div>

        {/* Message Preview */}
        <div className="space-y-3">
          <div className="flex justify-end">
            <div
              className="px-4 py-2 rounded-lg text-white text-sm max-w-[80%]"
              style={{ backgroundColor: primaryColor }}
            >
              Hello! How can you help me?
            </div>
          </div>

          <div className="flex justify-start">
            <div
              className="px-4 py-2 rounded-lg text-sm max-w-[80%]"
              style={{
                backgroundColor: secondaryColor,
                opacity: 0.8,
              }}
            >
              I'm here to assist you with any questions!
            </div>
          </div>
        </div>

        {/* Button Preview */}
        <div className="flex justify-center pt-2">
          <button
            className="px-4 py-2 rounded-md text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            Send Message
          </button>
        </div>
      </div>

      {/* Color Swatches */}
      <div className="mt-6 pt-4 border-t">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">Primary Color</p>
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded border"
                style={{ backgroundColor: primaryColor }}
              />
              <code className="text-xs">{primaryColor}</code>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Secondary Color</p>
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded border"
                style={{ backgroundColor: secondaryColor }}
              />
              <code className="text-xs">{secondaryColor}</code>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
