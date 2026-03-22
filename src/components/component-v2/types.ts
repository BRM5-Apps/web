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

export interface C2MediaGallery {
  id: string;
  type: "media_gallery";
  items: { url: string }[];
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
  | "create_thread"
  | "set_variable"
  | "delete_message"
  | "stop";

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

export type FlowAction =
  | FaDoNothing
  | FaWait
  | FaCheck
  | FaAddRole
  | FaRemoveRole
  | FaToggleRole
  | FaSendOutput
  | FaCreateThread
  | FaSetVariable
  | FaDeleteMessage
  | FaStop;

export type ActionGraphNodeKind = "action" | "condition";
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

export type ActionGraphNode = ActionGraphActionNode | ActionGraphConditionNode;

export interface ActionGraphEdge {
  id: string;
  source: string;
  target: string;
  kind: ActionGraphEdgeKind;
}

export interface ActionGraphDocument {
  version: 1;
  entry_node_id?: string;
  nodes: ActionGraphNode[];
  edges: ActionGraphEdge[];
}
