"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CopyButtonProps {
  text: string;
  size?: "sm" | "md" | "lg";
}

export default function CopyButton({ text, size = "sm" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="h-6 w-6"
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <Check className={`${sizeClasses[size]} text-green-600`} />
      ) : (
        <Copy className={sizeClasses[size]} />
      )}
    </Button>
  );
}
