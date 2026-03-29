// Send Command Status
export type SendCommandStatus = 'PENDING' | 'APPROVED' | 'DENIED' | 'SENT';

// Template Type
export type TemplateType = 'TEXT' | 'EMBED' | 'CONTAINER';

// Send Command Configuration
export interface SendCommandConfig {
  id: string;
  server_id: string;
  webhook_url?: string;
  webhook_username?: string;
  webhook_avatar_url?: string;
  default_channel_id?: string;
  require_approval: boolean;
  approval_channel_id?: string;
  approval_role_id?: string;
  created_at: string;
  updated_at: string;
  permissions?: SendCommandPermission[];
}

// Send Command Permission
export interface SendCommandPermission {
  id: string;
  config_id: string;
  role_id: string;
  can_send: boolean;
  can_approve: boolean;
  created_at: string;
}

// Pending Send Request
export interface PendingSendRequest {
  id: string;
  server_id: string;
  config_id: string;
  requested_by: string;
  channel_id: string;
  template_type: TemplateType;
  template_id: string;
  status: SendCommandStatus;
  approved_by?: string;
  denied_by?: string;
  denial_reason?: string;
  discord_message_id?: string;
  created_at: string;
  processed_at?: string;
  requester?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  approver?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  denier?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

// Create/Update Config Request
export interface CreateSendCommandConfigRequest {
  webhook_url?: string;
  webhook_username?: string;
  webhook_avatar_url?: string;
  default_channel_id?: string;
  require_approval?: boolean;
  approval_channel_id?: string;
  approval_role_id?: string;
}

export interface UpdateSendCommandConfigRequest {
  webhook_url?: string | null;
  webhook_username?: string | null;
  webhook_avatar_url?: string | null;
  default_channel_id?: string | null;
  require_approval?: boolean;
  approval_channel_id?: string | null;
  approval_role_id?: string | null;
}

// Permission Request
export interface CreateSendCommandPermissionRequest {
  role_id: string;
  can_send: boolean;
  can_approve: boolean;
}

export interface UpdateSendCommandPermissionRequest {
  role_id: string;
  can_send: boolean;
  can_approve: boolean;
}

// Pending Request Request
export interface CreatePendingSendRequestRequest {
  channel_id: string;
  template_type: TemplateType;
  template_id: string;
}

// Deny Request
export interface DenySendRequestRequest {
  reason?: string;
}

// Mark as Sent Request
export interface MarkAsSentRequest {
  discord_message_id: string;
}