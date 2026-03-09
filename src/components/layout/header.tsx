"use client";

import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-20 flex h-[var(--header-height)] items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div />
      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </header>
  );
}
