"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import MessageBubble from "@/components/MessageBubble";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Bot, Send, Sparkles, Square } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

// Simple UUID generator function
function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

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

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasAutoSentRef = useRef(false);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history or handle initial prompt
  useEffect(() => {
    const urlSessionId = searchParams.get("sessionId");
    const initialPrompt = searchParams.get("prompt");

    if (urlSessionId) {
      // Load existing conversation
      setSessionId(urlSessionId);
      loadChatHistory(urlSessionId);
      hasAutoSentRef.current = true;
    } else if (initialPrompt && !hasAutoSentRef.current) {
      // Auto-submit initial prompt for new chat (only once)
      hasAutoSentRef.current = true;
      setInput(decodeURIComponent(initialPrompt));
      setTimeout(() => {
        handleSend(decodeURIComponent(initialPrompt));
      }, 100);
    }
  }, [searchParams]);

  const loadChatHistory = async (sessionIdToLoad: string) => {
    try {
      setIsLoadingHistory(true);
      const userId = session?.user?.id;

      if (!userId) {
        console.error("No user ID available");
        return;
      }

      const response = await fetch(
        `/api/chat/history?userId=${userId}&sessionId=${sessionIdToLoad}`
      );

      if (response.ok) {
        const data = await response.json();
        const historyMessages: Message[] = data.messages.map(
          (msg: any, index: number) => ({
            id: `${Date.now()}-${index}`,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            tokens: msg.tokens,
          })
        );
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };


  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim()) return;

    // Abort any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Use a default tenant for now - you can make this dynamic later
      const tenantId = session?.user?.tenantId || "default";
      const userId = session?.user?.id;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          tenantId,
          sessionId,
          userId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      if (reader) {
        const assistantMessageId = (Date.now() + 1).toString();

        // Add empty assistant message
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessageId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
          },
        ]);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);

            // Check for token usage marker
            if (chunk.includes("__TOKEN_USAGE__")) {
              const parts = chunk.split("__TOKEN_USAGE__");
              assistantMessage += parts[0]; // Add any text before marker

              try {
                const tokenData = JSON.parse(parts[1]);
                // Update message with final content and token data
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: assistantMessage, tokens: tokenData }
                      : msg
                  )
                );
              } catch (e) {
                console.warn("Failed to parse token data:", e);
              }
            } else {
              assistantMessage += chunk;
              // Update the assistant message with accumulated content
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: assistantMessage }
                    : msg
                )
              );
            }
          }
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            console.log("Generation stopped by user");
            // Update the last message to show it was stopped
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: assistantMessage + "\n\n[Generation stopped]" }
                  : msg
              )
            );
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request cancelled");
      } else {
        console.error("Error sending message:", error);

        // Add error message
        const errorMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0 w-full">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="container flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/")}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-semibold">AI Assistant</h1>
              </div>
            </div>

            {session?.user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {session.user.name}
                </span>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {session.user.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="container max-w-4xl mx-auto py-6 space-y-6">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full py-20">
                <LoadingSpinner size="lg" text="Loading conversation..." />
              </div>
            ) : messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20">
                <Sparkles className="h-12 w-12 text-primary/50" />
                <div>
                  <h2 className="text-2xl font-semibold mb-2">
                    How can I help you today?
                  </h2>
                  <p className="text-muted-foreground">
                    Ask me anything and I'll do my best to assist you.
                  </p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex gap-4 justify-start">
                <Avatar className="h-8 w-8 shrink-0 mt-1">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <Card className="bg-muted p-4">
                  <LoadingSpinner size="sm" text="Thinking..." />
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0">
          <div className="container max-w-4xl mx-auto p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="relative"
            >
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="min-h-[60px] max-h-[200px] resize-none pr-12"
                disabled={isLoading}
              />
              {isLoading ? (
                <Button
                  type="button"
                  size="icon"
                  onClick={handleStop}
                  className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
                  variant="destructive"
                >
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className="absolute bottom-2 right-2 h-8 w-8 rounded-full"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </form>
            <p className="text-xs text-center text-muted-foreground mt-2">
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" text="Loading chat..." />
      </div>
    }>
      <ChatContent />
    </Suspense>
  );
}
