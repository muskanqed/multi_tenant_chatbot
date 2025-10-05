"use client";

import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

export default function MessageSkeleton() {
  return (
    <div className={cn("flex gap-3 max-w-[60%] mr-auto")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted"
        )}
      >
        <Bot className="h-4 w-4" />
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <div className="rounded-lg px-4 py-2 bg-muted">
          {/* Skeleton loading animation */}
          <div className="space-y-2 animate-pulse">
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-5/6"></div>
            <div className="h-4 bg-muted-foreground/20 rounded w-2/3"></div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-muted-foreground">Thinking...</span>
        </div>
      </div>
    </div>
  );
}
