"use client";

import { UserMenu } from "./user-menu";
import { NotificationBell } from "@/components/notifications/notification-bell";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-end gap-2 border-b bg-background px-4 md:px-6">
      <NotificationBell />
      <UserMenu />
    </header>
  );
}