"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Sparkles } from "lucide-react";
import ChatSidebar from "@/components/ChatSidebar";

// Simple UUID generator function
function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export default function Home() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [currentSessionId] = useState(() => generateSessionId());

  const handleNewChat = () => {
    const newSessionId = generateSessionId();
    setPrompt("");
    router.push("/chat");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      // Encode the prompt and redirect to chat page
      const encodedPrompt = encodeURIComponent(prompt.trim());
      router.push(`/chat?prompt=${encodedPrompt}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const examplePrompts = [
    "Help me understand how machine learning works",
    "Write a creative story about a time traveler",
    "Explain quantum computing in simple terms",
    "What are the best practices for React development?",
  ];

  return (
    <div className="flex h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Sidebar */}
      <ChatSidebar currentSessionId={currentSessionId} onNewChat={handleNewChat} />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Multi-Tenant AI Chat
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Ask me anything. I'm here to help.
          </p>
        </div>

        {/* Main Input Area */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What can I help you with today?"
              className="min-h-[120px] resize-none text-base pr-12 shadow-lg border-2 focus:border-primary transition-all"
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              disabled={!prompt.trim()}
              className="absolute bottom-3 right-3 h-10 w-10 rounded-full"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Press <kbd className="px-2 py-0.5 rounded bg-muted border">Enter</kbd> to send,
            <kbd className="px-2 py-0.5 rounded bg-muted border ml-1">Shift + Enter</kbd> for new line
          </p>
        </form>

        {/* Example Prompts */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground text-center">
            Try an example:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-left p-4 rounded-lg border border-border hover:border-primary hover:bg-muted/50 transition-all group"
              >
                <p className="text-sm text-foreground group-hover:text-primary transition-colors">
                  {example}
                </p>
              </button>
            ))}
          </div>
        </div>

          {/* Footer Info */}
          <div className="text-center text-xs text-muted-foreground">
            <p>Powered by Google Gemini AI • Multi-tenant architecture</p>
          </div>
        </div>
      </div>
    </div>
  );
}
