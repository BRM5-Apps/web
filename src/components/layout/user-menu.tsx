"use client";

import { useSession, signOut } from "next-auth/react";

export function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-3 rounded-md px-3 py-2">
      {session.user.image && (
        <img
          src={session.user.image}
          alt={session.user.name ?? "User"}
          className="h-8 w-8 rounded-full"
        />
      )}
      <div className="flex-1 truncate">
        <p className="text-sm font-medium truncate">{session.user.name}</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        Sign out
      </button>
    </div>
  );
}
