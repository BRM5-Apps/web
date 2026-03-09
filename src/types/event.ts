export interface Event {
  id: string;
  factionId?: string;
  factionHubId?: string;
  eventTypeId: string;
  title: string;
  description?: string;
  scheduledStart: string;
  scheduledEnd?: string;
  hostUserId: string;
  channelId?: string;
  vcChannelId?: string;
  messageId?: string;
  threadId?: string;
  status: "scheduled" | "active" | "completed" | "cancelled";
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventType {
  id: string;
  factionId?: string;
  factionHubId?: string;
  name: string;
  description?: string;
  defaultPoints: number;
}

export interface EventButton {
  label: string;
  style: "primary" | "secondary" | "success" | "danger";
  customId: string;
  action: string;
  position: number;
}

export interface EventRSVP {
  id: string;
  eventId: string;
  userId: string;
  status: string;
}

export interface EventRequest {
  id: string;
  factionId: string;
  userId: string;
  eventTypeId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  status: "pending" | "approved" | "denied";
}
