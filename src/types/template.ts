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
  template_data: Record<string, unknown>; // modal pages/fields JSON
  is_default?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledMessage {
  id: string;
  serverId: string;
  embedTemplateId?: string;
  textTemplateId?: string;
  containerTemplateId?: string;
  channelId: string;
  scheduledAt: string;
  repeatInterval?: string;
  isActive: boolean;
  lastSentAt?: string;
  createdAt: string;
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

/** Union for "any saved output (message or modal)" */
export type SavedTemplate =
  | { kind: "text"; template: TextTemplate }
  | { kind: "embed"; template: EmbedTemplate }
  | { kind: "container"; template: ContainerTemplate }
  | { kind: "modal"; template: ModalTemplate };
