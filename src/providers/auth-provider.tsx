"use client";

import { useSession } from "next-auth/react";
import { createContext, useContext, useMemo, type ReactNode } from "react";
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

  const value = useMemo<AuthContextValue>(() => {
    const isLoading = status === "loading";
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
  }, [session, status]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
