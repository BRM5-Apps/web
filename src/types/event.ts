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
  id: string;
  eventId: string;
  label: string;
  style: "primary" | "secondary" | "success" | "danger";
  customId: string;
  action: "rsvp" | "join" | "leave";
  position: number;
}

export interface EventRSVP {
  id: string;
  eventId: string;
  userId: string;
  eventButtonId: string;
  respondedAt: string;
  updatedAt: string;
}

export interface EventRequest {
  id: string;
  factionId: string;
  requestedById: string;
  title: string;
  description?: string;
  status: "pending" | "approved" | "denied";
  createdAt: string;
}

export interface EventLog {
  id: string;
  eventId?: string;
  factionId?: string;
  factionHubId?: string;
  loggedById: string;
  vcChannelId?: string;
  eventStartedAt: string;
  eventEndedAt: string;
  thresholdPercent: number;
  createdAt: string;
}

export interface EventAttendance {
  id: string;
  eventLogId: string;
  userId: string;
  joinedVcAt?: string;
  leftVcAt?: string;
  totalSeconds?: number;
  attendancePercent?: number;
  metThreshold: boolean;
  createdAt: string;
}
