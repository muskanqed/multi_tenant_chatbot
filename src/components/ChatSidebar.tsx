"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, LogOut, Menu, MessageSquare, Plus, Shield, Sparkles, X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
}: ChatSidebarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapsed state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const userId = session?.user?.id;

      if (!userId) {
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams({ userId });

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
    router.push("/");
  };

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <>
      {/* Header with Logo */}
      <div className={cn("p-4 border-b", collapsed && "p-2")}>
        {collapsed ? (
          <div className="flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Claude</h1>
          </div>
        )}
      </div>

      {/* New Chat Button */}
      <div className={cn("px-3 pt-3", collapsed && "px-2 pt-2")}>
        {collapsed ? (
          <Button
            onClick={handleNewChat}
            className="w-full"
            size="icon"
            title="New Chat"
          >
            <Plus className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleNewChat}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            New chat
          </Button>
        )}
      </div>

      {/* Admin Panel Button */}
      {!collapsed && session?.user?.role === "admin" && (
        <div className="px-3 py-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/admin")}
          >
            <Shield className="h-4 w-4" />
            Admin Panel
          </Button>
        </div>
      )}

      {/* Recents Section */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {!collapsed && (
          <div className="px-3 py-2 shrink-0">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Recents
            </h2>
          </div>
        )}

        <ScrollArea className="flex-1 min-h-0">
          <div className={cn("px-3 pb-3 space-y-0.5", collapsed && "px-1")}>
            {isLoading ? (
              <div className={cn(
                "text-center py-8 text-muted-foreground text-sm",
                collapsed && "py-4"
              )}>
                {collapsed ? "..." : "Loading..."}
              </div>
            ) : sessions.length === 0 ? (
              <div className={cn(
                "text-center py-8 text-muted-foreground text-sm",
                collapsed && "py-4"
              )}>
                {collapsed ? "" : "No chats yet"}
              </div>
            ) : (
              sessions.map((chatSession) => (
                <button
                  key={chatSession._id}
                  className={cn(
                    "w-full text-left rounded-lg transition-colors",
                    currentSessionId === chatSession.sessionId
                      ? "bg-accent"
                      : "hover:bg-accent/50",
                    collapsed ? "p-2" : "px-3 py-2"
                  )}
                  onClick={() => handleSessionClick(chatSession.sessionId)}
                  title={collapsed ? chatSession.title : undefined}
                >
                  {collapsed ? (
                    <div className="flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ) : (
                    <p className="text-sm text-foreground line-clamp-1">
                      {chatSession.title}
                    </p>
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* User Profile Section */}
      {!collapsed && session?.user && (
        <div className="p-3 border-t shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent cursor-pointer">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-xs">
                    {session.user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.user.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Collapse Toggle Button */}
      {!collapsed && (
        <div className="px-3 pb-3 shrink-0">
          <Button
            onClick={toggleCollapse}
            variant="ghost"
            className="w-full gap-2 justify-start text-muted-foreground"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
            Collapse
          </Button>
        </div>
      )}
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
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-background border-r flex flex-col h-screen"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex border-r bg-background flex-col relative transition-all duration-300 ease-in-out h-screen",
          isCollapsed ? "md:w-[60px]" : "md:w-[280px]"
        )}
      >
        <SidebarContent collapsed={isCollapsed} />

        {/* Expand Button (only visible when collapsed) */}
        {isCollapsed && (
          <div className="absolute top-4 -right-3 z-10">
            <Button
              onClick={toggleCollapse}
              variant="outline"
              size="icon"
              className="h-6 w-6 rounded-full bg-background shadow-md"
              title="Expand Sidebar"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
