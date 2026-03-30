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
    if (!backendToken && typeof document !== "undefined") {
      const m = document.cookie.match(/(?:^|; )backendToken=([^;]+)/);
      backendToken = m ? decodeURIComponent(m[1]) : undefined;
    }

    const user: AuthUser | null = discordId
      ? {
          discordId,
          username: session.username ?? "",
          avatarUrl: generateAvatarUrl(discordId, session.avatar),
        }
      : null;

    return {
      user,
      isAuthenticated: !!backendToken,
      isLoading,
      backendToken,
      authError: session?.authError,
    };
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