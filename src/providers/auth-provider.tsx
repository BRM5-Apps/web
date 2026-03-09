"use client";

import { useSession } from "next-auth/react";
import { createContext, useContext, type ReactNode } from "react";
import type { User } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const user: User | null = session?.user
    ? {
        id: "",
        discordId: "",
        username: session.user.name ?? "",
        avatarUrl: session.user.image ?? undefined,
        globalRole: "user",
        createdAt: "",
        updatedAt: "",
      }
    : null;

  return (
    <AuthContext.Provider value={{ user, isLoading: status === "loading" }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
