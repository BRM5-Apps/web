"use client";

export type ButtonStyle = "blurple" | "grey" | "green" | "red";

export interface C2Button {
  id: string;
  type: "button";
  label: string; // max 80
  style: ButtonStyle;
  emoji?: string;
  disabled: boolean;
  flow: FlowAction[];
  actionGraph?: ActionGraphDocument;
}

export interface C2LinkButton {
  id: string;
  type: "link_button";
  label: string; // max 80
  url: string;
  emoji?: string;
  disabled: boolean;
}

export type C2SelectMenuType =
  | "select"
  | "user_select"
  | "role_select"
  | "user_role_select"
  | "channel_select";

export interface SelectOption {
  id: string;
  emoji?: string;
  label: string;       // required, max 100
  description?: string; // max 100
  value: string;       // required, max 100, auto-generated
  default: boolean;
  flow: FlowAction[];
  actionGraph?: ActionGraphDocument;
}

export interface C2SelectMenu {
  id: string;
  type: "select_menu";
  menuType: C2SelectMenuType;
  placeholder: string;    // max 150
  minValues: number;
  maxValues: number;
  disabled: boolean;
  options: SelectOption[];    // used when menuType === "select"
  defaultValues: string[];    // snowflake IDs; used when menuType !== "select"
  flow: FlowAction[];         // used when menuType !== "select"
  actionGraph?: ActionGraphDocument;
}

export type C2RowComponent = C2Button | C2LinkButton | C2SelectMenu;

export interface C2Row {
  id: string;
  type: "row";
  components: C2RowComponent[];
}

export interface C2Text {
  id: string;
  type: "text";
  content: string; // max 4000
}

export interface C2SectionContent {
  id: string;
  content: string; // max 4000
}

export interface C2Thumbnail {
  id: string;
  type: "thumbnail";
  url: string;
}

export type C2Accessory = C2Button | C2LinkButton | C2Thumbnail;

export interface C2Section {
  id: string;
  type: "section";
  label: string;
  contents: C2SectionContent[];
  accessory?: C2Accessory;
}

export interface C2MediaGalleryItem {
  url?: string;                      // Static URL (existing)
  statCard?: DynamicStatsCardConfig; // Stats card config (Advanced Mode)
}

export interface StatCardConfig {
  element: string;      // Element key
  label: string;        // Display label
  format: "number" | "compact" | "percent";
  color?: string;       // Optional override
}

export interface GraphConfig {
  show: boolean;
  type: "line" | "bar" | "area" | "donut";
  timeRange: "7d" | "14d" | "30d";
  color: string;
}

export interface CardStyleConfig {
  layout: "compact" | "standard" | "detailed";
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderRadius: number;
  showTitle: boolean;
  title: string;
  titleSize: number;
  showTimestamp: boolean;
  footerText: string;
}

export interface C2MediaGallery {
  id: string;
  type: "media_gallery";
  items: C2MediaGalleryItem[];
}

export interface C2File {
  id: string;
  type: "file";
  fileUrl?: string;
}

export interface C2Separator {
  id: string;
  type: "separator";
  size: "small" | "large";
  dividerLine: boolean;
}

export type C2ContainerChild =
  | C2Text
  | C2Row
  | C2MediaGallery
  | C2File
  | C2Separator
  | C2Section;

export interface C2Container {
  id: string;
  type: "container";
  spoiler: boolean;
  accentColor?: string;
  collapsed: boolean;
  children: C2ContainerChild[];
}

export type C2TopLevelItem =
  | C2Container
  | C2Text
  | C2Row
  | C2MediaGallery
  | C2File
  | C2Separator
  | C2Section;

// ── Flow Actions ────────────────────────────────────────────────────────────

export type FlowActionType =
  | "do_nothing"
  | "wait"
  | "check"
  | "add_role"
  | "remove_role"
  | "toggle_role"
  | "send_output"
  | "send_to_channel"
  | "dm_user"
  | "log_to_channel"
  | "create_thread"
  | "set_variable"
  | "delete_message"
  | "cooldown"
  | "webhook_call"
  | "stop"
  // Consolidated action types
  | "role_action"
  | "nickname_action"
  | "voice_action"
  | "channel_action"
  | "message_action"
  | "thread_action"
  | "moderation_action"
  | "data_action"
  | "flow_control"
  | "wait_until"
  | "modal_action"
  // Integration actions
  | "roblox_verify";

// ── Consolidated Action Operation Types ──────────────────────────────────────

export type RoleActionOperation =
  | "add"
  | "remove"
  | "toggle"
  | "add_temporary";

export type NicknameActionOperation =
  | "set_nickname"
  | "reset_nickname";

export type VoiceOperation =
  | "move"
  | "disconnect"
  | "mute"
  | "deafen"
  | "unmute"
  | "undeafen";

export type ChannelOperation =
  | "create"
  | "delete"
  | "edit"
  | "lock"
  | "unlock"
  | "slow_mode"
  | "clear_slow_mode"
  | "archive_thread";

export type MessageOperation =
  // Send operations
  | "send_output"    // Send template/message to channel, DM, or as reply
  | "edit_message"   // Edit a prior message
  // Message management operations
  | "delete"
  | "pin"
  | "unpin"
  | "react";

export type ThreadOperation =
  | "create"
  | "archive"
  | "delete";

export type NicknameOperation =
  | "set_nickname"
  | "reset_nickname";

export type ModerationOperation =
  | "kick"
  | "ban"
  | "unban"
  | "timeout"
  | "remove_timeout"
  | "warn"
  | "clear_warnings"
  | "quarantine";

export type DataOperation =
  | "increment"
  | "decrement"
  | "append"
  | "remove"
  | "set"
  | "random_number"
  | "random_choice";

export type FlowControlOperation =
  | "loop"
  | "parallel"
  | "try_catch"
  | "subflow"
  | "return"
  | "break"
  | "continue"
  | "retry";

export type DurationUnit = "seconds" | "minutes" | "hours" | "days" | "weeks" | "months";

export type ChannelType = "text" | "voice" | "announcement" | "stage" | "category";

export interface FlowActionBase {
  id: string;
  type: FlowActionType;
}

export interface FaDoNothing extends FlowActionBase {
  type: "do_nothing";
}

export interface FaWait extends FlowActionBase {
  type: "wait";
  duration: number;  // The numeric value
  unit: "seconds" | "minutes" | "hours" | "days" | "weeks" | "months";
}

export interface FaCheck extends FlowActionBase {
  type: "check";
  functionId?: string;
  condition?: ConditionNode;  // Visual condition tree
  passBranch: FlowAction[];
  failBranch: FlowAction[];
}

// ── Condition System ───────────────────────────────────────────────────────
// Visual condition builder types - replaces raw JSON editing

export type ConditionOperator =
  | "and"
  | "or"
  | "not"
  | "equal"
  | "in"
  | "member_has_role"
  | "member_has_permission"
  | "channel_is"
  | "message_contains"
  | "starts_with"
  | "ends_with"
  | "matches_regex"
  | "greater_than"
  | "less_than"
  | "is_empty"
  | "is_not_empty";

export interface ConditionNodeBase {
  id: string;
  operator: ConditionOperator;
}

// Logical combinators
export interface AndCondition extends ConditionNodeBase {
  operator: "and";
  conditions: ConditionNode[];
}

export interface OrCondition extends ConditionNodeBase {
  operator: "or";
  conditions: ConditionNode[];
}

export interface NotCondition extends ConditionNodeBase {
  operator: "not";
  condition: ConditionNode;
}

// Comparison operators
export interface EqualCondition extends ConditionNodeBase {
  operator: "equal";
  left: ValueSource;
  right: ValueSource;
}

export interface InCondition extends ConditionNodeBase {
  operator: "in";
  element: ValueSource;
  array: ValueSource; // Should resolve to array or JSON string like ["a","b","c"]
}

export interface GreaterThanCondition extends ConditionNodeBase {
  operator: "greater_than";
  left: ValueSource;
  right: ValueSource;
}

export interface LessThanCondition extends ConditionNodeBase {
  operator: "less_than";
  left: ValueSource;
  right: ValueSource;
}

// String operators
export interface StartsWithCondition extends ConditionNodeBase {
  operator: "starts_with";
  value: ValueSource;
  prefix: ValueSource;
}

export interface EndsWithCondition extends ConditionNodeBase {
  operator: "ends_with";
  value: ValueSource;
  suffix: ValueSource;
}

export interface MessageContainsCondition extends ConditionNodeBase {
  operator: "message_contains";
  substring: string;
}

export interface MatchesRegexCondition extends ConditionNodeBase {
  operator: "matches_regex";
  pattern: string;
}

// Discord-specific operators
export interface MemberHasRoleCondition extends ConditionNodeBase {
  operator: "member_has_role";
  roleId: string; // Can be element token like {{element:roleId}}
}

export interface MemberHasPermissionCondition extends ConditionNodeBase {
  operator: "member_has_permission";
  permission: string;
}

export interface ChannelIsCondition extends ConditionNodeBase {
  operator: "channel_is";
  channelId: string;
}

// Presence checks
export interface IsEmptyCondition extends ConditionNodeBase {
  operator: "is_empty";
  value: ValueSource;
}

export interface IsNotEmptyCondition extends ConditionNodeBase {
  operator: "is_not_empty";
  value: ValueSource;
}

export type ConditionNode =
  | AndCondition
  | OrCondition
  | NotCondition
  | EqualCondition
  | InCondition
  | GreaterThanCondition
  | LessThanCondition
  | StartsWithCondition
  | EndsWithCondition
  | MessageContainsCondition
  | MatchesRegexCondition
  | MemberHasRoleCondition
  | MemberHasPermissionCondition
  | ChannelIsCondition
  | IsEmptyCondition
  | IsNotEmptyCondition;

// ── Value Sources ──────────────────────────────────────────────────────────
// Where values can come from in conditions

export type ValueSourceType =
  | "static"
  | "element"
  | "variable"
  | "user"
  | "member"
  | "server"
  | "message"
  | "channel";

export interface ValueSource {
  type: ValueSourceType;
  value: string; // The actual value or token reference
  label?: string; // Human-readable label for display
}

// Predefined value source helpers
export const VALUE_SOURCES = {
  static: (value: string): ValueSource => ({ type: "static", value, label: `"${value}"` }),
  element: (key: string): ValueSource => ({ type: "element", value: `{{element:${key}}}`, label: `Element: ${key}` }),
  variable: (name: string): ValueSource => ({ type: "variable", value: `{{var:${name}}}`, label: `Var: ${name}` }),
  userId: (): ValueSource => ({ type: "user", value: "{{user.id}}", label: "User ID" }),
  userName: (): ValueSource => ({ type: "user", value: "{{user.username}}", label: "Username" }),
  memberNick: (): ValueSource => ({ type: "member", value: "{{member.nick}}", label: "Nickname" }),
  serverName: (): ValueSource => ({ type: "server", value: "{{server.name}}", label: "Server Name" }),
  serverId: (): ValueSource => ({ type: "server", value: "{{server.id}}", label: "Server ID" }),
  messageContent: (): ValueSource => ({ type: "message", value: "{{message.content}}", label: "Message Content" }),
  channelId: (): ValueSource => ({ type: "channel", value: "{{channel.id}}", label: "Channel ID" }),
  channelName: (): ValueSource => ({ type: "channel", value: "{{channel.name}}", label: "Channel Name" }),
} as const;

export interface FaAddRole extends FlowActionBase {
  type: "add_role";
  roleIds: string[];  // Support multiple roles
}

export interface FaRemoveRole extends FlowActionBase {
  type: "remove_role";
  roleIds: string[];  // Support multiple roles
}

export interface FaToggleRole extends FlowActionBase {
  type: "toggle_role";
  roleIds: string[];  // Support multiple roles
}

export type SendOutputKind = "message" | "modal";
export type SendOutputTemplateType = "text" | "embed" | "container" | "modal";

export interface FaSendOutput extends FlowActionBase {
  type: "send_output";
  outputKind: SendOutputKind;
  templateId?: string;
  templateType?: SendOutputTemplateType;
  channelId?: string;   // Optional channel ID for sending to specific channel
  hidden: boolean;
  reply?: boolean;      // Reply to the triggering message
  replyEphemeral?: boolean; // Reply as ephemeral
  edit?: boolean;       // Edit the triggering message
  editOriginal?: boolean; // Edit original response (for deferred interactions)
}

export interface FaCreateThread extends FlowActionBase {
  type: "create_thread";
  channelId?: string;
  name: string;
  threadType?: string;
  autoArchive?: string;
}

export interface FaSetVariable extends FlowActionBase {
  type: "set_variable";
  varType: string;
  varName: string;
  value: string;
}

export interface FaDeleteMessage extends FlowActionBase {
  type: "delete_message";
  messageId?: string;
}

export interface FaStop extends FlowActionBase {
  type: "stop";
  content: string;
  hidden: boolean;
  silent: boolean;
  hideEmbeds: boolean;
}

// Automation-specific actions
export interface FaSendToChannel extends FlowActionBase {
  type: "send_to_channel";
  channelId: string; // Can use {{element:xxx}} or {{event.channel.id}}
  templateId?: string;
  templateType?: SendOutputTemplateType;
}

export interface FaDmUser extends FlowActionBase {
  type: "dm_user";
  templateId?: string;
  templateType?: SendOutputTemplateType;
  fallbackOnError?: boolean; // If DM fails, send to fallback channel
  fallbackChannelId?: string;
}

export type LogLevel = "info" | "warn" | "error" | "success";

export interface FaLogToChannel extends FlowActionBase {
  type: "log_to_channel";
  channelId: string;
  level: LogLevel;
  content: string; // Can use {{xxx}} variables
  includeContext?: boolean; // Include event context in log
}

export interface FaCooldown extends FlowActionBase {
  type: "cooldown";
  key: string; // Cooldown identifier, can use {{xxx}} variables
  duration: number;
  unit: "seconds" | "minutes" | "hours" | "days";
  bypassRoles?: string[]; // Roles that bypass cooldown
}

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface FaWebhookCall extends FlowActionBase {
  type: "webhook_call";
  url: string; // URL template with {{xxx}} variables
  method: HttpMethod;
  headers?: Record<string, string>; // Key-value headers
  body?: string; // Request body template (for POST/PUT/PATCH)
  timeout?: number; // Request timeout in ms (default 30000)
  retryOnFailure?: boolean; // Retry on 4xx/5xx errors
  retryCount?: number; // Max retry attempts
}

// ── Consolidated Action Interfaces ───────────────────────────────────────────

/**
 * FaRoleAction - Consolidates role management operations
 * Operations: add, remove, toggle, add_temporary
 */
export interface FaRoleAction extends FlowActionBase {
  type: "role_action";
  operation: RoleActionOperation;
  roleIds?: string[];
  duration?: number;
  durationUnit?: DurationUnit;
  targetUserId?: string; // If omitted, uses event user
  reason?: string;
}

/**
 * FaNicknameAction - Nickname management operations
 * Operations: set_nickname, reset_nickname
 */
export interface FaNicknameAction extends FlowActionBase {
  type: "nickname_action";
  operation: NicknameActionOperation;
  nickname?: string; // For set_nickname
  targetUserId?: string; // If omitted, uses event user
  reason?: string;
}

/**
 * FaVoiceAction - Voice channel operations
 * Operations: move, disconnect, mute, deafen, unmute, undeafen
 */
export interface FaVoiceAction extends FlowActionBase {
  type: "voice_action";
  operation: VoiceOperation;
  targetChannelId?: string; // For move operation
  targetUserId?: string; // If omitted, uses event user
  reason?: string;
}

/**
 * FaChannelAction - Channel management operations
 * Operations: create, delete, edit, lock, unlock, slow_mode, clear_slow_mode, archive_thread
 */
export interface FaChannelAction extends FlowActionBase {
  type: "channel_action";
  operation: ChannelOperation;
  channelId?: string; // For delete, edit, lock, unlock, slow_mode, clear_slow_mode, archive_thread
  channelName?: string; // For create, edit
  channelType?: ChannelType; // For create
  parentId?: string; // Category ID for create
  position?: number; // Position for create/edit
  topic?: string; // For create/edit
  nsfw?: boolean; // For create/edit
  slowModeDelay?: number; // Seconds for slow_mode
  permissions?: ChannelPermissionOverride[]; // For create/edit
  reason?: string;
}

/**
 * Channel permission override for channel creation/editing
 */
export interface ChannelPermissionOverride {
  roleId?: string;
  memberId?: string;
  allow?: string[]; // Permission names
  deny?: string[]; // Permission names
}

/**
 * FaMessageAction - Consolidated message operations
 * Operations: send_output, edit_message, delete, pin, unpin, react
 */
export interface FaMessageAction extends FlowActionBase {
  type: "message_action";
  operation: MessageOperation;
  // Send output operation - send template/message to channel, DM, or as reply
  templateId?: string;
  templateType?: SendOutputTemplateType;
  sendAs?: "channel" | "dm" | "reply"; // Where to send the message
  channelId?: string; // Required for channel send, optional for reply (uses trigger channel)
  fallbackChannelId?: string; // For DM fallback
  hidden?: boolean; // For ephemeral responses
  // Edit message operation
  messageId?: string; // Message to edit (can reference a prior message in the flow)
  newContent?: string; // New content for edit
  // React operation
  emoji?: string;
  // Reason for moderation actions
  reason?: string;
}

/**
 * FaThreadAction - Thread operations
 * Operations: create, archive, delete
 */
export interface FaThreadAction extends FlowActionBase {
  type: "thread_action";
  operation: ThreadOperation;
  channelId?: string; // Parent channel for create
  threadId?: string; // For archive, delete
  name?: string; // For create
  threadType?: "public" | "private" | "news";
  autoArchive?: number; // Auto archive duration in minutes
  reason?: string;
}

/**
 * FaModerationAction - Moderation operations
 * Operations: kick, ban, unban, timeout, remove_timeout, warn, clear_warnings, quarantine
 */
export interface FaModerationAction extends FlowActionBase {
  type: "moderation_action";
  operation: ModerationOperation;
  targetUserId?: string; // If omitted, uses event user
  reason?: string;
  duration?: number; // For timeout
  durationUnit?: DurationUnit; // For timeout
  deleteMessageDays?: number; // For ban (0-7)
  warnId?: string; // For clear_warnings (specific warn)
  quarantineRoleId?: string; // For quarantine
}

/**
 * FaDataAction - Variable/data operations
 * Operations: increment, decrement, append, remove, set, random_number, random_choice
 */
export interface FaDataAction extends FlowActionBase {
  type: "data_action";
  operation: DataOperation;
  varName: string;
  value?: string | number; // For increment/decrement/append/remove/set
  min?: number; // For random_number
  max?: number; // For random_number
  choices?: string[]; // For random_choice
}

/**
 * FaFlowControl - Advanced flow control operations
 * Operations: loop, parallel, try_catch, subflow, return, break, continue, retry
 */
export interface FaFlowControl extends FlowActionBase {
  type: "flow_control";
  operation: FlowControlOperation;
  iterations?: number; // For loop
  loopActions?: FlowAction[]; // Actions inside loop
  parallelActions?: FlowAction[][]; // Actions to run in parallel
  tryActions?: FlowAction[]; // For try_catch
  catchActions?: FlowAction[]; // For try_catch
  subflowId?: string; // For subflow
  maxRetries?: number; // For retry
  retryDelay?: number; // For retry (ms)
  errorVariable?: string; // Variable to store error message in catchActions
}

/**
 * FaWaitUntil - Wait until a condition or time
 */
export interface FaWaitUntil extends FlowActionBase {
  type: "wait_until";
  timestamp?: string; // ISO datetime to wait until
  condition?: ConditionNode; // Condition to wait for
  maxWait?: number; // Maximum wait time in seconds
  checkInterval?: number; // How often to check condition (seconds)
}

/**
 * ModalOperation - Operations for modal interactions
 */
export type ModalOperation = "show" | "close" | "update";

/**
 * FaModalAction - Modal interaction operations
 * Operations: show, close, update
 */
export interface FaModalAction extends FlowActionBase {
  type: "modal_action";
  operation: ModalOperation;
  // For show
  modalId?: string; // Template ID to show
  title?: string; // Override title
  customId?: string; // Custom ID for tracking
  // For update
  targetModalId?: string; // The modal instance to update
  fields?: Record<string, string>; // Field updates
  // For close
  closeModalId?: string; // Specific modal to close (or current if not specified)
}

/**
 * FaRobloxVerify - Roblox account verification action
 * Triggers Roblox OAuth verification flow for the user
 */
export interface FaRobloxVerify extends FlowActionBase {
  type: "roblox_verify";
  // Whether verification is required (if true, action fails if user cancels)
  requireVerified?: boolean;
  // Role to assign after successful verification
  assignRoleOnVerify?: string;
  // Custom message to show if verification is required
  messageOnRequired?: string;
  // Skip if already verified
  skipIfVerified?: boolean;
}

export type FlowAction =
  | FaDoNothing
  | FaWait
  | FaCheck
  | FaAddRole
  | FaRemoveRole
  | FaToggleRole
  | FaSendOutput
  | FaSendToChannel
  | FaDmUser
  | FaLogToChannel
  | FaCreateThread
  | FaSetVariable
  | FaDeleteMessage
  | FaCooldown
  | FaWebhookCall
  | FaStop
  // Consolidated actions
  | FaRoleAction
  | FaNicknameAction
  | FaVoiceAction
  | FaChannelAction
  | FaMessageAction
  | FaThreadAction
  | FaModerationAction
  | FaDataAction
  | FaFlowControl
  | FaWaitUntil
  | FaModalAction
  // Integration actions
  | FaRobloxVerify;

export type ActionGraphNodeKind = "action" | "condition" | "trigger" | "modal_field";
export type ActionGraphEdgeKind = "next" | "pass" | "fail";

export interface ActionGraphPosition {
  x: number;
  y: number;
}

export interface ActionGraphActionNode {
  id: string;
  kind: "action";
  action: FlowAction;
  position?: ActionGraphPosition;
}

export interface ActionGraphConditionNode {
  id: string;
  kind: "condition";
  condition?: ConditionNode;
  position?: ActionGraphPosition;
}

export type EventFilterOperator = "equals" | "not_equals" | "contains" | "not_contains" | "in" | "not_in" | "matches";

export interface EventFilter {
  id: string;
  field: string;
  operator: EventFilterOperator;
  value: string;
}

export interface ActionGraphTriggerNode {
  id: string;
  kind: "trigger";
  triggerType: "TIME" | "EVENT";
  eventType?: string;
  label?: string; // Human-readable label for the trigger (e.g., "Field: Username")
  cronExpression?: string;
  timezone?: string;
  filters?: EventFilter[];
  position?: ActionGraphPosition;
}

// ── Modal Field Node ──────────────────────────────────────────────────────────
// Represents a modal field in the action graph for the Modal Workbench

export type ModalComponentType =
  | "short-answer"
  | "paragraph"
  | "multiple-choice"
  | "checkboxes"
  | "dropdown"
  | "text-display"
  | "file-upload"
  | "single-checkbox"
  | "user-select"
  | "role-select"
  | "channel-select"
  | "user-role-select";

export interface ActionGraphModalFieldNode {
  id: string;
  kind: "modal_field";
  fieldId: string;        // Reference to the modal component ID
  fieldLabel: string;     // Human-readable label for display
  fieldType: ModalComponentType;
  isRequired: boolean;
  position?: ActionGraphPosition;
}

export type ActionGraphNode =
  | ActionGraphActionNode
  | ActionGraphConditionNode
  | ActionGraphTriggerNode
  | ActionGraphModalFieldNode;

export interface ActionGraphEdge {
  id: string;
  source: string;
  target: string;
  kind: ActionGraphEdgeKind;
  // Note: Connection sides are calculated dynamically based on node positions, not stored
}

export interface ActionGraphDocument {
  version: 1;
  entry_node_id?: string;
  nodes: ActionGraphNode[];
  edges: ActionGraphEdge[];
}

// ── Modal Flow Types ──────────────────────────────────────────────────────────

// Simple settings for modal workbench (synced with action graph)
export interface ModalSettings {
  roleRestrictions?: string[];  // Roles required to submit
  outputChannels?: string[];    // Channels to send submission to
  roleAssignments?: string[];   // Roles to add on submission
  roleRemovals?: string[];      // Roles to remove on submission
  mentions?: string[];          // Users/roles to ping
}

// Maps field IDs to node IDs in the action graph
export type FieldNodeMap = Record<string, string>;

// Modal flow document wraps the action graph with modal-specific metadata
export interface ModalFlowDocument {
  version: 1;
  graph: ActionGraphDocument;
  settings: ModalSettings;
  fieldNodes: FieldNodeMap;  // fieldId -> nodeId mapping
}

// ── Advanced Stats Card Types ────────────────────────────────────────────────

// ValueSource for stats card bindings — typed reference to a runtime value
export type StatsCardValueSource =
  | { type: "server_stat"; key: string }
  | { type: "element"; key: string }
  | { type: "variable"; key: string }
  | { type: "literal"; value: number | string };

// Binding for a single stat's value and optional color
export interface StatsCardStatBindingEntry {
  value: StatsCardValueSource;
  color?: StatsCardValueSource;
}

// Binding for the graph's data series
export interface StatsCardGraphBinding {
  data?: StatsCardValueSource;
}

// Full bindings map for Advanced Mode
export interface StatsCardBindingConfig {
  stats?: Record<string, StatsCardStatBindingEntry>;
  graph?: StatsCardGraphBinding;
}

// Extended DynamicStatsCardConfig with computation layer
export interface DynamicStatsCardConfig {
  layout: "compact" | "standard" | "detailed";
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderRadius: number;
  showTitle: boolean;
  title: string;
  titleSize: number;
  showTimestamp: boolean;
  footerText: string;
  stats: StatCardConfig[];
  showGraph: boolean;
  graphType: "line" | "bar" | "area" | "donut";
  graphTimeRange: "7d" | "14d" | "30d";
  graphColor: string;
  // Computation layer (Advanced Mode) — undefined = Basic Mode
  computation?: ActionGraphDocument;
  bindings?: StatsCardBindingConfig;
}
