"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import AuthLoadingProvider from "./AuthLoadingProvider";

interface SessionProviderProps {
  children: ReactNode;
}

export default function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      <AuthLoadingProvider>{children}</AuthLoadingProvider>
    </NextAuthSessionProvider>
  );
}
