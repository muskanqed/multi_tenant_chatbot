"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Plus, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatSession {
  _id: string;
  sessionId: string;
  title: string;
  lastMessageAt: string;
}

interface ChatSidebarProps {
  currentSessionId?: string;
  onNewChat: () => void;
}

export default function ChatSidebar({
  currentSessionId,
  onNewChat,
}: ChatSidebarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const tenantId = session?.user?.tenantId || "default";
      const userId = session?.user?.id;

      const params = new URLSearchParams({ tenantId });
      if (userId) params.append("userId", userId);

      const response = await fetch(`/api/chat/sessions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/chat?sessionId=${sessionId}`);
    setIsMobileOpen(false);
  };

  const handleNewChat = () => {
    onNewChat();
    setIsMobileOpen(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b">
        <Button
          onClick={handleNewChat}
          className="w-full gap-2"
          variant="default"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Loading chats...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No chat history yet
            </div>
          ) : (
            sessions.map((chatSession) => (
              <Card
                key={chatSession._id}
                className={cn(
                  "p-3 cursor-pointer hover:bg-accent transition-colors",
                  currentSessionId === chatSession.sessionId && "bg-accent"
                )}
                onClick={() => handleSessionClick(chatSession.sessionId)}
              >
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {chatSession.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(chatSession.lastMessageAt)}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50 rounded-full"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </Button>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        >
          <div
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-background border-r flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-[280px] border-r bg-background flex-col">
        <SidebarContent />
      </div>
    </>
  );
}
