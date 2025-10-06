"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

interface AuthLoadingProviderProps {
  children: ReactNode;
}

export default function AuthLoadingProvider({ children }: AuthLoadingProviderProps) {
  const { status } = useSession();

  // Show full-screen loader while checking authentication
  if (status === "loading") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          {/* Spinner */}
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />

          {/* Loading text */}
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Render children when auth is ready
  return <>{children}</>;
}
