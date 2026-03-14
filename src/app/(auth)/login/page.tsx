"use client";

import { Suspense, useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

function LoginContent() {
  const { status, data: session } = useSession();
  const [exchanging, setExchanging] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const error = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/select-server";

  // Redirect if already authenticated
  useEffect(() => {
    async function runExchange() {
      try {
        setExchanging(true);
        const res = await fetch("/api/auth/exchange", { method: "POST" });
        if (!res.ok) {
          // Stay on login; error UI below will show generic message
          return;
        }
        router.replace(callbackUrl);
      } finally {
        setExchanging(false);
      }
    }
    if (status === "authenticated") {
      runExchange();
    }
  }, [status, router, callbackUrl]);

  // Loading state while checking session
  if (status === "loading" || (status === "authenticated" && exchanging)) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Signing you in…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3">
        <Image
          src="/images/logo.svg"
          alt="FactionHub"
          width={64}
          height={64}
          priority
        />
        <h1 className="text-3xl font-bold tracking-tight">FactionHub</h1>
        <p className="text-muted-foreground">
          Manage your factions, events, and community
        </p>
      </div>

      {error && <AuthError error={error} />}

      <Button
        size="lg"
        className="w-full max-w-xs gap-3 bg-discord-blurple text-white hover:bg-discord-blurple/90"
        onClick={() => signIn("discord", { callbackUrl })}
      >
        <DiscordIcon />
        Continue with Discord
      </Button>

      {session?.authError && (
        <Button
          variant="outline"
          className="w-full max-w-xs"
          onClick={async () => {
            await fetch("/api/auth/clear", { method: "POST" });
            await signOut({ callbackUrl: "/login" });
          }}
        >
          Sign out and retry
        </Button>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function AuthError({ error }: { error: string }) {
  const messages: Record<string, string> = {
    OAuthCallback: "Discord sign-in was cancelled or denied.",
    OAuthAccountNotLinked: "This Discord account is linked to another user.",
    AccessDenied: "Access denied. You may not have permission to sign in.",
    default: "Something went wrong during sign-in. Please try again.",
  };

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      {messages[error] ?? messages.default}
    </div>
  );
}

function DiscordIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}
