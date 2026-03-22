"use client";

import {
  QueryClient,
  QueryClientProvider,
  QueryErrorResetBoundary,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: true,
            // Resource-specific overrides can be set per-query:
            // - User session / permissions: staleTime 5min (rarely changes)
            // - Stats / leaderboard: staleTime 2min (aggregated data)
            // - Events list: staleTime 30s (time-sensitive)
          },
          mutations: {
            retry: 0, // Mutations are not idempotent — never auto-retry
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorResetBoundary>{() => children}</QueryErrorResetBoundary>
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
