"use client";

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import CopyButton from "./CopyButton";
import MarkdownRenderer from "./MarkdownRenderer";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tokens?: {
    promptTokens: number;
    responseTokens: number;
    totalTokens: number;
  };
}

interface MessageBubbleProps {
  message: Message;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
}

export default function MessageBubble({ message, theme }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 max-w-[80%]",
        isUser ? "ml-auto flex-row-reverse w-fit" : "mr-auto"
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
        style={isUser && theme?.primaryColor ? { backgroundColor: theme.primaryColor } : {}}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <div
          className={cn(
            "rounded-lg px-4 py-2",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted"
          )}
          style={isUser && theme?.primaryColor ? { backgroundColor: theme.primaryColor, color: "white" } : {}}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
              <MarkdownRenderer content={message.content} />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
          {message.role === "assistant" && message.tokens && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span
                className="text-xs text-muted-foreground"
                title={`Prompt: ${message.tokens.promptTokens} | Response: ${message.tokens.responseTokens}`}
              >
                {message.tokens.totalTokens.toLocaleString()} tokens
              </span>
            </>
          )}
          {!isUser && <CopyButton text={message.content} />}
        </div>
      </div>
    </div>
  );
}
