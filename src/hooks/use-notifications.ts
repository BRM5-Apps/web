import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/auth-provider";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { invalidateRelated } from "@/lib/query-utils";
import type { Notification, NotificationListResponse } from "@/types/notification";

/**
 * Hook to fetch notifications for a server.
 */
export function useNotifications(
  serverId: string,
  params?: { page?: number; limit?: number; unreadOnly?: boolean }
) {
  const { isAuthenticated } = useAuth();
  return useQuery<NotificationListResponse>({
    queryKey: queryKeys.notifications.list(serverId, params),
    queryFn: ({ signal }) => api.notifications.list(serverId, params, { signal }),
    enabled: !!serverId && isAuthenticated,
    retry: false,
  });
}

/**
 * Hook to mark a single notification as read.
 */
export function useMarkNotificationRead(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      api.notifications.markRead(serverId, notificationId),
    onSuccess: () => {
      invalidateRelated(queryClient, "notifications", serverId);
    },
  });
}

/**
 * Hook to mark all notifications as read.
 */
export function useMarkAllNotificationsRead(serverId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.notifications.markAllRead(serverId),
    onSuccess: () => {
      invalidateRelated(queryClient, "notifications", serverId);
    },
  });
}