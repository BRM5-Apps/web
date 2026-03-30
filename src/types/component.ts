// Button Styles (Discord API values)
export type ButtonStyle = 'PRIMARY' | 'SECONDARY' | 'SUCCESS' | 'DANGER' | 'LINK';

// Component Action Types
export type ComponentActionType = 'SEND_MESSAGE' | 'TOGGLE_ROLE' | 'OPEN_MODAL' | 'RUN_SEQUENCE' | 'LINK';

// Component Types for Attachments
export type ComponentType = 'BUTTON' | 'SELECT_MENU';

// Action Configuration - varies based on action type
export interface SendMessageActionConfig {
  template_id: string;
  template_type: 'text' | 'embed' | 'container';
  channel_id: string;
}

export interface ToggleRoleActionConfig {
  role_ids: string[];
}

export interface OpenModalActionConfig {
  modal_template_id: string;
}

export interface RunSequenceActionConfig {
  sequence_id: string;
}

export interface LinkActionConfig {
  url: string;
}

export type ActionConfig =
  | SendMessageActionConfig
  | ToggleRoleActionConfig
  | OpenModalActionConfig
  | RunSequenceActionConfig
  | LinkActionConfig;

// Button Template
export interface ButtonTemplate {
  id: string;
  server_id: string;
  name: string;
  label: string;
  style: ButtonStyle;
  emoji?: string;
  url?: string;
  disabled: boolean;
  action_type: ComponentActionType;
  action_config: ActionConfig;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Select Menu Option
export interface SelectMenuOption {
  label: string;
  value: string;
  description?: string;
  emoji?: string;
  default?: boolean;
}

// Select Menu Template
export interface SelectMenuTemplate {
  id: string;
  server_id: string;
  name: string;
  placeholder?: string;
  min_values: number;
  max_values: number;
  disabled: boolean;
  options: SelectMenuOption[];
  action_type: Exclude<ComponentActionType, 'LINK'>; // Select menus don't support LINK
  action_config: Exclude<ActionConfig, LinkActionConfig>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Component Attachment - links a component to a container
export interface ComponentAttachment {
  id: string;
  container_template_id: string;
  component_type: ComponentType;
  component_id: string;
  position: number;
  created_at: string;
}

// Create/Update Request Types
export interface CreateButtonTemplateRequest {
  name: string;
  label: string;
  style: ButtonStyle;
  emoji?: string;
  url?: string;
  disabled?: boolean;
  action_type: ComponentActionType;
  action_config: ActionConfig;
}

export interface UpdateButtonTemplateRequest {
  name?: string;
  label?: string;
  style?: ButtonStyle;
  emoji?: string;
  url?: string;
  disabled?: boolean;
  action_type?: ComponentActionType;
  action_config?: ActionConfig;
}

export interface CreateSelectMenuTemplateRequest {
  name: string;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
  options: SelectMenuOption[];
  action_type: Exclude<ComponentActionType, 'LINK'>;
  action_config: Exclude<ActionConfig, LinkActionConfig>;
}

export interface UpdateSelectMenuTemplateRequest {
  name?: string;
  placeholder?: string;
  min_values?: number;
  max_values?: number;
  disabled?: boolean;
  options?: SelectMenuOption[];
  action_type?: Exclude<ComponentActionType, 'LINK'>;
  action_config?: Exclude<ActionConfig, LinkActionConfig>;
}

export interface CreateComponentAttachmentRequest {
  container_template_id: string;
  component_type: ComponentType;
  component_id: string;
  position?: number;
}

export interface ReorderComponentsRequest {
  container_template_id: string;
  attachment_ids: string[];
}