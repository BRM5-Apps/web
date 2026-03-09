"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get("code");
    if (code) {
      signIn("discord", { callbackUrl: "/dashboard" });
    } else {
      router.replace("/login");
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-muted-foreground">Completing sign-in…</p>
    </div>
  );
}
