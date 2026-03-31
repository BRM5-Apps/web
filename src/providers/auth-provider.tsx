"use client";

import { useSession } from "next-auth/react";
import { createContext, useContext, useMemo, useEffect, useState, type ReactNode } from "react";
import { generateAvatarUrl } from "@/lib/utils";

export interface AuthUser {
  discordId: string;
  username: string;
  avatarUrl: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  backendToken: string | undefined;
  authError: string | undefined;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  backendToken: undefined,
  authError: undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  // Track if we've done an initial hydration check for the cookie
  // This prevents isAuthenticated from flickering to false during navigation
  const [hydrated, setHydrated] = useState(false);

  // Mark as hydrated after first client-side render
  useEffect(() => {
    // Only set hydrated after we've had a chance to read the cookie
    // This happens synchronously in the useMemo below, but we need to
    // ensure we don't report isLoading: false until after initial render
    if (status !== "loading") {
      setHydrated(true);
    }
  }, [status]);

  const value = useMemo<AuthContextValue>(() => {
    const sessionLoading = status === "loading";
    // Consider loading if session is loading OR if we haven't hydrated yet
    const isLoading = sessionLoading || !hydrated;
    const discordId = session?.discordId;
    let backendToken = session?.backendToken;

    // Debug: log cookie state
    if (typeof document !== "undefined") {
      const cookieStr = document.cookie;
      const backendTokenMatch = cookieStr.match(/(?:^|; )backendToken=([^;]+)/);
      console.log("[auth-provider] Cookie check:", {
        hasCookie: !!backendTokenMatch,
        cookieLength: cookieStr?.length || 0,
        sessionStatus: status,
        hasSessionBackendToken: !!session?.backendToken,
      });

      if (!backendToken && backendTokenMatch) {
        backendToken = decodeURIComponent(backendTokenMatch[1]);
        console.log("[auth-provider] Token from cookie, length:", backendToken?.length);
      }
    }

    const user: AuthUser | null = discordId
      ? {
          discordId,
          username: session.username ?? "",
          avatarUrl: generateAvatarUrl(discordId, session.avatar),
        }
      : null;

    const result = {
      user,
      isAuthenticated: !!backendToken,
      isLoading,
      backendToken,
      authError: session?.authError,
    };

    console.log("[auth-provider] Result:", { isAuthenticated: result.isAuthenticated, isLoading: result.isLoading });

    return result;
  }, [session, status, hydrated]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}