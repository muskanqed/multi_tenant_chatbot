"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatExportButtonProps {
  messages: Message[];
  tenantName?: string;
}

export default function ChatExportButton({
  messages,
  tenantName = "Chat",
}: ChatExportButtonProps) {
  const exportToJSON = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tenantName}-chat-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToText = () => {
    const textContent = messages
      .map((msg) => {
        const role = msg.role === "user" ? "You" : "Assistant";
        const time = new Date(msg.timestamp).toLocaleString();
        return `[${time}] ${role}:\n${msg.content}\n`;
      })
      .join("\n");

    const dataBlob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tenantName}-chat-${new Date().toISOString()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToMarkdown = () => {
    const markdown = messages
      .map((msg) => {
        const role = msg.role === "user" ? "**You**" : "**Assistant**";
        const time = new Date(msg.timestamp).toLocaleString();
        return `### ${role} - ${time}\n\n${msg.content}\n`;
      })
      .join("\n---\n\n");

    const header = `# ${tenantName} Chat Export\n\nExported on: ${new Date().toLocaleString()}\n\n---\n\n`;
    const fullContent = header + markdown;

    const dataBlob = new Blob([fullContent], { type: "text/markdown" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${tenantName}-chat-${new Date().toISOString()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportToText}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export as TXT
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToMarkdown}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export as MD
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToJSON}
        className="gap-2"
      >
        <Download className="h-4 w-4" />
        Export as JSON
      </Button>
    </div>
  );
}
