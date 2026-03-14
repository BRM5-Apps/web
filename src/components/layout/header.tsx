"use client";

import { Search, Bell } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { Breadcrumbs } from "./breadcrumbs";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/hooks/use-websocket";

export function Header() {
  const { status } = useWebSocket();

  const statusDot: Record<string, string> = {
    connected: "bg-emerald-500",
    connecting: "bg-amber-500 animate-pulse",
    disconnected: "bg-muted-foreground/40",
  };

  return (
    <header className="sticky top-0 z-20 flex h-[var(--header-height)] items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left: breadcrumbs */}
      <Breadcrumbs />

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden gap-2 text-muted-foreground md:flex"
          onClick={() => {
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
          }}
        >
          <Search className="h-4 w-4" />
          <span className="text-xs">Search...</span>
          <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            Ctrl+K
          </kbd>
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
        <span
          title={`WebSocket: ${status}`}
          className={`h-2 w-2 rounded-full ${statusDot[status]}`}
        />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
