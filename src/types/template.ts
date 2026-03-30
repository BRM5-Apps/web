export interface EmbedTemplate {
  id: string;
  serverId?: string;
  hubId?: string;
  name: string;
  title?: string;
  description?: string;
  color?: string;
  fields?: EmbedField[];
  footer?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  authorName?: string;
  authorIconUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface ContainerTemplate {
  id: string;
  serverId?: string;
  hubId?: string;
  name: string;
  template_data: { components?: unknown[] };
  is_default?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TextTemplate {
  id: string;
  serverId?: string;
  hubId?: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModalTemplate {
  id: string;
  serverId?: string;
  name: string;
  template_data: { pages?: unknown[] };
  action_graph?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  is_default?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ModalElementRegistration links a modal field to an element key
export interface ModalElementRegistration {
  id: string;
  server_id: string;
  modal_template_id: string;
  field_id: string;        // Component ID within modal
  element_key: string;    // e.g., "application_username"
  field_type: string;     // "short-answer", "paragraph", "dropdown", etc.
  field_label: string;     // Human-readable label
  modal_name: string;      // Modal template name (for grouping)
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledMessage {
  id: string;
  server_id: string;
  channel_id: string;
  name: string;
  schedule_type: "ONCE" | "CRON" | "DAILY" | "WEEKLY" | "MONTHLY";
  cron_expression?: string;
  next_run_at: string;
  last_run_at?: string;
  template_type: "TEXT" | "EMBED" | "CONTAINER";
  template_id: string;
  status: "PENDING" | "RUNNING" | "PAUSED" | "COMPLETED" | "FAILED";
  error_count: number;
  error_message?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  edit_mode: "SEND_NEW" | "EDIT_PREVIOUS";
  linked_message_schedule_id?: string;
  discord_message_id?: string;
}

export interface MessageSend {
  id: string;
  server_id: string;
  channel_id: string;
  template_type: "text" | "embed" | "container";
  template_id: string;
  status: "pending" | "sent" | "failed";
  error_msg?: string;
  created_at: string;
  sent_at?: string;
}

// Request DTO for creating a scheduled message (matches backend DTO)
export interface CreateScheduledMessageRequest {
  name: string;
  channel_id: string;
  schedule_type: "ONCE" | "CRON" | "DAILY" | "WEEKLY" | "MONTHLY";
  cron_expression?: string;
  next_run_at: string; // ISO timestamp
  template_type: "TEXT" | "EMBED" | "CONTAINER";
  template_id: string;
  edit_mode?: "SEND_NEW" | "EDIT_PREVIOUS";
  linked_message_schedule_id?: string;
}

/** Union for "any saved output (message or modal)" */
export type SavedTemplate =
  | { kind: "text"; template: TextTemplate }
  | { kind: "embed"; template: EmbedTemplate }
  | { kind: "container"; template: ContainerTemplate }
  | { kind: "modal"; template: ModalTemplate };
