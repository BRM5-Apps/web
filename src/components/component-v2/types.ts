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

export type C2Accessory = C2LinkButton | C2Thumbnail;

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
  seconds: number;
}

export interface FaCheck extends FlowActionBase {
  type: "check";
  functionId?: string;
  passBranch: FlowAction[];
  failBranch: FlowAction[];
}

export interface FaAddRole extends FlowActionBase {
  type: "add_role";
  roleId?: string;
}

export interface FaRemoveRole extends FlowActionBase {
  type: "remove_role";
  roleId?: string;
}

export interface FaToggleRole extends FlowActionBase {
  type: "toggle_role";
  roleId?: string;
}

export type SendOutputKind = "message" | "modal";
export type SendOutputTemplateType = "text" | "embed" | "container" | "modal";

export interface FaSendOutput extends FlowActionBase {
  type: "send_output";
  outputKind: SendOutputKind;
  templateId?: string;
  templateType?: SendOutputTemplateType;
  hidden: boolean;
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
