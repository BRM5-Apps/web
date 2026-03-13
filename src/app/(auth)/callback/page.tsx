"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function CallbackPage() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const callbackError = searchParams.get("error");

  useEffect(() => {
    if (callbackError) {
      setError(
        callbackError === "access_denied"
          ? "Discord sign-in was cancelled."
          : "An error occurred during sign-in."
      );
      return;
    }

    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, callbackError, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-6 py-4 text-sm text-destructive">
          {error}
        </div>
        <Button
          variant="outline"
          onClick={() => router.replace("/login")}
        >
          Back to Login
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-muted-foreground">Completing sign-in…</p>
    </div>
  );
}
