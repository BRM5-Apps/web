"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
      <Toaster richColors position="bottom-right" />
    </SessionProvider>
  );
}
