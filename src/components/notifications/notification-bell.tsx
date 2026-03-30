"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/use-notifications";
import { useServerStore } from "@/stores/server-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";
import type { Notification } from "@/types/notification";

export function NotificationBell() {
  const { activeServer } = useServerStore();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useNotifications(activeServer?.id ?? "", { limit: 10 });
  const markRead = useMarkNotificationRead(activeServer?.id ?? "");
  const markAllRead = useMarkAllNotificationsRead(activeServer?.id ?? "");

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  function handleMarkRead(notificationId: string) {
    markRead.mutate(notificationId);
  }

  function handleMarkAllRead() {
    markAllRead.mutate();
  }

  if (!activeServer) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="p-2 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.slice(0, 5).map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
            />
          ))
        )}

        {notifications.length > 5 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm text-muted-foreground">
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const isUnread = !notification.isRead;

  return (
    <DropdownMenuItem
      className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
        isUnread ? "bg-primary/5" : ""
      }`}
      onClick={() => isUnread && onMarkRead(notification.id)}
    >
      <div className="flex items-center gap-2 w-full">
        <span className="font-medium text-sm flex-1">{notification.title}</span>
        {isUnread && (
          <Badge variant="default" className="h-2 w-2 rounded-full p-0" />
        )}
      </div>
      {notification.message && (
        <span className="text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </span>
      )}
      <span className="text-xs text-muted-foreground">
        {formatRelativeTime(notification.createdAt)}
      </span>
    </DropdownMenuItem>
  );
}