// Notification types
export type NotificationType =
  | 'unit_cap'
  | 'promotion'
  | 'position_assigned'
  | 'position_removed'
  | 'branch_change'
  | 'unit_transfer'
  | 'rank_change';

// Notification represents an in-app notification for a server member
export interface Notification {
  id: string;
  serverId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// Notification list response
export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Payload for creating a notification (internal use)
export interface NotificationPayload {
  serverId: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}