"use client";

import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className={`${sizeClasses[size]} animate-spin`} />
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
}
