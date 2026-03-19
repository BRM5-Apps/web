// WebSocket event types — must match Go EventType constants exactly.
export type WsEventType =
  | "audit_log"
  | "bot_status"
  | "application_submitted"
  | "automation_executed"
  | "ping";

// The envelope every message is wrapped in.
export interface WsEnvelope<T = unknown> {
  type: WsEventType;
  serverId: string;
  timestamp: string; // ISO 8601
  payload: T;
}

// Payload types — field names must match Go json tags exactly.
export interface AuditLogPayload {
  id: string;
  action: string;
  actorId: string;
  actorName: string;
  targetId: string;
  targetName: string;
  details: string;
}

export interface BotStatusPayload {
  online: boolean;
  latencyMs: number;
}

export interface ApplicationSubmittedPayload {
  applicationId: string;
  applicantId: string;
  applicantName: string;
  formName: string;
}

export interface AutomationExecutedPayload {
  workflowId: string;
  workflowName: string;
  triggeredBy: string;
  success: boolean;
  error?: string;
}
