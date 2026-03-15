/**
 * Bidirectional converter between internal C2TopLevelItem[] types
 * and Discord Component V2 JSON format.
 */
import type {
  C2TopLevelItem,
  C2Container,
  C2ContainerChild,
  C2Text,
  C2Row,
  C2Section,
  C2SectionContent,
  C2MediaGallery,
  C2File,
  C2Separator,
  C2Button,
  C2LinkButton,
  C2SelectMenu,
  C2Thumbnail,
  C2Accessory,
  C2RowComponent,
  SelectOption,
  FlowAction,
  ButtonStyle,
  C2SelectMenuType,
} from "./types";

// ── Discord type number mappings ──────────────────────────────────────────────

const COMPONENT_TYPE_MAP: Record<string, number> = {
  row: 1,
  button: 2,
  link_button: 2,
  select_menu: 3,
  section: 9,
  text: 10,
  thumbnail: 11,
  media_gallery: 12,
  file: 13,
  separator: 14,
  container: 17,
};

const BUTTON_STYLE_MAP: Record<ButtonStyle, number> = {
  blurple: 1,
  grey: 2,
  green: 3,
  red: 4,
};

const BUTTON_STYLE_REVERSE: Record<number, ButtonStyle> = {
  1: "blurple",
  2: "grey",
  3: "green",
  4: "red",
};

const ACTION_TYPE_MAP: Record<string, number> = {
  do_nothing: 0,
  wait: 1,
  check: 2,
  add_role: 3,
  remove_role: 4,
  toggle_role: 5,
  send_output: 6,
  create_thread: 7,
  set_variable: 8,
  delete_message: 9,
  stop: 10,
};

const ACTION_TYPE_REVERSE: Record<number, string> = {};
for (const [k, v] of Object.entries(ACTION_TYPE_MAP)) {
  ACTION_TYPE_REVERSE[v] = k;
}

const SELECT_TYPE_MAP: Record<C2SelectMenuType, number> = {
  select: 3,
  user_select: 5,
  role_select: 6,
  user_role_select: 7,
  channel_select: 8,
};

const SELECT_TYPE_REVERSE: Record<number, C2SelectMenuType> = {
  3: "select",
  5: "user_select",
  6: "role_select",
  7: "user_role_select",
  8: "channel_select",
};

// ── Export: toDiscordJSON ──────────────────────────────────────────────────────

export function toDiscordJSON(items: C2TopLevelItem[]): object {
  return {
    flags: 32768,
    components: items.map(convertItem),
  };
}

function convertItem(item: C2TopLevelItem | C2ContainerChild): object {
  switch (item.type) {
    case "container":
      return convertContainer(item);
    case "text":
      return convertText(item);
    case "section":
      return convertSection(item);
    case "row":
      return convertRow(item);
    case "media_gallery":
      return convertMediaGallery(item);
    case "file":
      return convertFile(item);
    case "separator":
      return convertSeparator(item);
    default:
      return {};
  }
}

function convertContainer(c: C2Container): object {
  const result: Record<string, unknown> = {
    type: 17,
    components: c.children.map(convertItem),
  };
  if (c.accentColor) {
    result.accent_color = parseInt(c.accentColor.slice(1), 16);
  }
  if (c.spoiler) {
    result.spoiler = true;
  }
  return result;
}

function convertText(t: C2Text): object {
  return { type: 10, content: t.content };
}

function convertSection(s: C2Section): object {
  const result: Record<string, unknown> = {
    type: 9,
    components: s.contents.map((c) => ({ type: 10, content: c.content })),
  };
  if (s.accessory) {
    result.accessory = convertAccessory(s.accessory);
  }
  return result;
}

function convertAccessory(acc: C2Accessory): object {
  switch (acc.type) {
    case "button":
      return convertButton(acc);
    case "link_button":
      return convertLinkButton(acc);
    case "thumbnail":
      return convertThumbnail(acc);
    default:
      return {};
  }
}

function convertRow(r: C2Row): object {
  return {
    type: 1,
    components: r.components.map(convertRowComponent),
  };
}

function convertRowComponent(comp: C2RowComponent): object {
  switch (comp.type) {
    case "button":
      return convertButton(comp);
    case "link_button":
      return convertLinkButton(comp);
    case "select_menu":
      return convertSelectMenu(comp);
    default:
      return {};
  }
}

function convertButton(b: C2Button): object {
  const result: Record<string, unknown> = {
    type: 2,
    style: BUTTON_STYLE_MAP[b.style],
    label: b.label,
    custom_id: b.id,
  };
  if (b.emoji) {
    result.emoji = { name: b.emoji };
  }
  if (b.disabled) {
    result.disabled = true;
  }
  if (b.flow && b.flow.length > 0) {
    result.flow = { actions: convertActions(b.flow) };
  }
  return result;
}

function convertLinkButton(b: C2LinkButton): object {
  const result: Record<string, unknown> = {
    type: 2,
    style: 5,
    label: b.label,
    url: b.url,
    custom_id: b.id,
  };
  if (b.emoji) {
    result.emoji = { name: b.emoji };
  }
  if (b.disabled) {
    result.disabled = true;
  }
  return result;
}

function convertSelectMenu(s: C2SelectMenu): object {
  const typeNum = SELECT_TYPE_MAP[s.menuType];
  const result: Record<string, unknown> = {
    type: typeNum,
    custom_id: s.id,
    placeholder: s.placeholder,
    min_values: s.minValues,
    max_values: s.maxValues,
  };
  if (s.disabled) {
    result.disabled = true;
  }

  if (s.menuType === "select") {
    result.options = s.options.map(convertSelectOption);
    const flows: Record<string, object> = {};
    for (const opt of s.options) {
      if (opt.flow && opt.flow.length > 0) {
        flows[opt.value] = { actions: convertActions(opt.flow) };
      }
    }
    if (Object.keys(flows).length > 0) {
      result.flows = flows;
    }
  } else {
    if (s.defaultValues && s.defaultValues.length > 0) {
      result.default_values = s.defaultValues;
    }
    if (s.flow && s.flow.length > 0) {
      result.flow = { actions: convertActions(s.flow) };
    }
  }
  return result;
}

function convertSelectOption(opt: SelectOption): object {
  const result: Record<string, unknown> = {
    label: opt.label,
    value: opt.value,
  };
  if (opt.description) {
    result.description = opt.description;
  }
  if (opt.default) {
    result.default = true;
  }
  if (opt.emoji) {
    result.emoji = { name: opt.emoji };
  }
  return result;
}

function convertMediaGallery(mg: C2MediaGallery): object {
  return {
    type: 12,
    items: mg.items.map((item) => ({ media: { url: item.url } })),
  };
}

function convertFile(f: C2File): object {
  const result: Record<string, unknown> = { type: 13 };
  if (f.fileUrl) {
    result.file = { url: f.fileUrl };
  }
  return result;
}

function convertSeparator(s: C2Separator): object {
  return {
    type: 14,
    spacing: s.size === "small" ? 1 : 2,
    divider: s.dividerLine,
  };
}

function convertThumbnail(t: C2Thumbnail): object {
  return {
    type: 11,
    media: { url: t.url },
  };
}

// ── Flow Actions Export ───────────────────────────────────────────────────────

export function convertActions(actions: FlowAction[]): object[] {
  return actions.map(convertAction);
}

function convertAction(action: FlowAction): object {
  const base: Record<string, unknown> = {
    type: ACTION_TYPE_MAP[action.type],
  };

  switch (action.type) {
    case "do_nothing":
      break;
    case "wait":
      base.seconds = action.seconds;
      break;
    case "check":
      if (action.condition) {
        base.function = action.condition;
      }
      base.then = convertActions(action.passBranch);
      base.else = convertActions(action.failBranch);
      break;
    case "add_role":
    case "remove_role":
    case "toggle_role":
      if (action.roleId) {
        base.role_id = action.roleId;
      }
      break;
    case "send_output":
      base.output_kind = action.outputKind;
      if (action.templateId) {
        base.template_id = action.templateId;
      }
      if (action.templateType) {
        base.template_type = action.templateType;
      }
      if (action.hidden) {
        base.hidden = true;
      }
      break;
    case "create_thread":
      if (action.channelId) {
        base.channel_id = action.channelId;
      }
      base.name = action.name;
      if (action.threadType) {
        base.thread_type = action.threadType;
      }
      if (action.autoArchive) {
        base.auto_archive = action.autoArchive;
      }
      break;
    case "set_variable":
      base.var_type = action.varType;
      base.var_name = action.varName;
      base.value = action.value;
      break;
    case "delete_message":
      if (action.messageId) {
        base.message_id = action.messageId;
      }
      break;
    case "stop":
      base.content = action.content;
      if (action.hidden) {
        base.hidden = true;
      }
      if (action.silent) {
        base.silent = true;
      }
      if (action.hideEmbeds) {
        base.hide_embeds = true;
      }
      break;
  }

  return base;
}

// ── Import: fromDiscordJSON ───────────────────────────────────────────────────

export function fromDiscordJSON(json: unknown): C2TopLevelItem[] {
  if (!json || typeof json !== "object") return [];

  let components: unknown[];

  if (Array.isArray(json)) {
    components = json;
  } else {
    const obj = json as Record<string, unknown>;
    if (Array.isArray(obj.components)) {
      components = obj.components;
    } else {
      return [];
    }
  }

  return components
    .map(parseTopLevelItem)
    .filter((item): item is C2TopLevelItem => item !== null);
}

function uid(): string {
  return crypto.randomUUID();
}

function parseTopLevelItem(raw: unknown): C2TopLevelItem | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const type = obj.type as number;

  switch (type) {
    case 17:
      return parseContainer(obj);
    case 10:
      return parseText(obj);
    case 9:
      return parseSection(obj);
    case 1:
      return parseRow(obj);
    case 12:
      return parseMediaGallery(obj);
    case 13:
      return parseFile(obj);
    case 14:
      return parseSeparator(obj);
    default:
      console.warn(`Unknown Discord component type: ${type}`);
      return null;
  }
}

function parseContainer(obj: Record<string, unknown>): C2Container {
  const children = Array.isArray(obj.components)
    ? (obj.components as unknown[])
        .map(parseContainerChild)
        .filter((c): c is C2ContainerChild => c !== null)
    : [];

  let accentColor: string | undefined;
  if (typeof obj.accent_color === "number") {
    accentColor = "#" + obj.accent_color.toString(16).padStart(6, "0");
  }

  return {
    id: uid(),
    type: "container",
    spoiler: obj.spoiler === true,
    accentColor,
    collapsed: false,
    children,
  };
}

function parseContainerChild(raw: unknown): C2ContainerChild | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const type = obj.type as number;

  switch (type) {
    case 10:
      return parseText(obj);
    case 9:
      return parseSection(obj);
    case 1:
      return parseRow(obj);
    case 12:
      return parseMediaGallery(obj);
    case 13:
      return parseFile(obj);
    case 14:
      return parseSeparator(obj);
    default:
      console.warn(`Unknown container child type: ${type}`);
      return null;
  }
}

function parseText(obj: Record<string, unknown>): C2Text {
  return {
    id: uid(),
    type: "text",
    content: (obj.content as string) ?? "",
  };
}

function parseSection(obj: Record<string, unknown>): C2Section {
  const rawComponents = Array.isArray(obj.components)
    ? (obj.components as Record<string, unknown>[])
    : [];

  const contents: C2SectionContent[] = rawComponents.map((c) => ({
    id: uid(),
    content: (c.content as string) ?? "",
  }));

  let accessory: C2Accessory | undefined;
  if (obj.accessory && typeof obj.accessory === "object") {
    accessory = parseAccessory(obj.accessory as Record<string, unknown>);
  }

  return {
    id: uid(),
    type: "section",
    label: "",
    contents,
    accessory,
  };
}

function parseAccessory(
  obj: Record<string, unknown>
): C2Accessory | undefined {
  const type = obj.type as number;
  const style = obj.style as number | undefined;

  if (type === 2) {
    if (style === 5 && obj.url) {
      return parseLinkButton(obj);
    }
    return parseButton(obj);
  }
  if (type === 11) {
    return parseThumbnail(obj);
  }
  return undefined;
}

function parseRow(obj: Record<string, unknown>): C2Row {
  const rawComponents = Array.isArray(obj.components)
    ? (obj.components as unknown[])
    : [];

  return {
    id: uid(),
    type: "row",
    components: rawComponents
      .map(parseRowComponent)
      .filter((c): c is C2RowComponent => c !== null),
  };
}

function parseRowComponent(raw: unknown): C2RowComponent | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const type = obj.type as number;

  if (type === 2) {
    const style = obj.style as number | undefined;
    if (style === 5 && obj.url) {
      return parseLinkButton(obj);
    }
    return parseButton(obj);
  }

  if (type in SELECT_TYPE_REVERSE) {
    return parseSelectMenu(obj, type);
  }

  console.warn(`Unknown row component type: ${type}`);
  return null;
}

function parseButton(obj: Record<string, unknown>): C2Button {
  const style = BUTTON_STYLE_REVERSE[(obj.style as number) ?? 1] ?? "blurple";
  const emoji = obj.emoji as Record<string, unknown> | undefined;

  return {
    id: (obj.custom_id as string) ?? uid(),
    type: "button",
    label: (obj.label as string) ?? "",
    style,
    emoji: emoji?.name as string | undefined,
    disabled: obj.disabled === true,
    flow: obj.flow
      ? parseActions(
          (obj.flow as Record<string, unknown>).actions as unknown[]
        )
      : [],
  };
}

function parseLinkButton(obj: Record<string, unknown>): C2LinkButton {
  const emoji = obj.emoji as Record<string, unknown> | undefined;

  return {
    id: (obj.custom_id as string) ?? uid(),
    type: "link_button",
    label: (obj.label as string) ?? "",
    url: (obj.url as string) ?? "",
    emoji: emoji?.name as string | undefined,
    disabled: obj.disabled === true,
  };
}

function parseSelectMenu(
  obj: Record<string, unknown>,
  typeNum: number
): C2SelectMenu {
  const menuType = SELECT_TYPE_REVERSE[typeNum] ?? "select";

  let options: SelectOption[] = [];
  let flow: FlowAction[] = [];
  let defaultValues: string[] = [];

  if (menuType === "select") {
    const rawOptions = Array.isArray(obj.options)
      ? (obj.options as Record<string, unknown>[])
      : [];
    const rawFlows = (obj.flows as Record<string, Record<string, unknown>>) ?? {};

    options = rawOptions.map((opt) => {
      const optEmoji = opt.emoji as Record<string, unknown> | undefined;
      const optValue = (opt.value as string) ?? "";
      const optFlow = rawFlows[optValue];
      return {
        id: uid(),
        emoji: optEmoji?.name as string | undefined,
        label: (opt.label as string) ?? "",
        description: opt.description as string | undefined,
        value: optValue,
        default: opt.default === true,
        flow: optFlow
          ? parseActions(optFlow.actions as unknown[])
          : [],
      };
    });
  } else {
    if (Array.isArray(obj.default_values)) {
      defaultValues = obj.default_values as string[];
    }
    if (obj.flow) {
      flow = parseActions(
        (obj.flow as Record<string, unknown>).actions as unknown[]
      );
    }
  }

  return {
    id: (obj.custom_id as string) ?? uid(),
    type: "select_menu",
    menuType,
    placeholder: (obj.placeholder as string) ?? "",
    minValues: (obj.min_values as number) ?? 1,
    maxValues: (obj.max_values as number) ?? 1,
    disabled: obj.disabled === true,
    options,
    defaultValues,
    flow,
  };
}

function parseMediaGallery(obj: Record<string, unknown>): C2MediaGallery {
  const rawItems = Array.isArray(obj.items)
    ? (obj.items as Record<string, unknown>[])
    : [];

  return {
    id: uid(),
    type: "media_gallery",
    items: rawItems.map((item) => {
      const media = item.media as Record<string, unknown> | undefined;
      return { url: (media?.url as string) ?? "" };
    }),
  };
}

function parseFile(obj: Record<string, unknown>): C2File {
  const file = obj.file as Record<string, unknown> | undefined;
  return {
    id: uid(),
    type: "file",
    fileUrl: file?.url as string | undefined,
  };
}

function parseSeparator(obj: Record<string, unknown>): C2Separator {
  return {
    id: uid(),
    type: "separator",
    size: obj.spacing === 1 ? "small" : "large",
    dividerLine: obj.divider !== false,
  };
}

function parseThumbnail(obj: Record<string, unknown>): C2Thumbnail {
  const media = obj.media as Record<string, unknown> | undefined;
  return {
    id: uid(),
    type: "thumbnail",
    url: (media?.url as string) ?? "",
  };
}

// ── Flow Actions Import ───────────────────────────────────────────────────────

function parseActions(raw: unknown[]): FlowAction[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(parseAction)
    .filter((a): a is FlowAction => a !== null);
}

function parseAction(raw: unknown): FlowAction | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const typeNum = obj.type as number;
  const typeName = ACTION_TYPE_REVERSE[typeNum];

  if (!typeName) {
    console.warn(`Unknown flow action type: ${typeNum}`);
    return null;
  }

  const id = uid();

  switch (typeName) {
    case "do_nothing":
      return { id, type: "do_nothing" };

    case "wait":
      return { id, type: "wait", seconds: (obj.seconds as number) ?? 0 };

    case "check":
      return {
        id,
        type: "check",
        condition: obj.function as Record<string, unknown> | undefined,
        passBranch: parseActions(obj.then as unknown[]),
        failBranch: parseActions(obj.else as unknown[]),
      };

    case "add_role":
      return { id, type: "add_role", roleId: obj.role_id as string | undefined };

    case "remove_role":
      return {
        id,
        type: "remove_role",
        roleId: obj.role_id as string | undefined,
      };

    case "toggle_role":
      return {
        id,
        type: "toggle_role",
        roleId: obj.role_id as string | undefined,
      };

    case "send_output":
      return {
        id,
        type: "send_output",
        outputKind: (obj.output_kind as "message" | "modal") ?? "message",
        templateId: obj.template_id as string | undefined,
        templateType: obj.template_type as
          | "text"
          | "embed"
          | "container"
          | "modal"
          | undefined,
        hidden: obj.hidden === true,
      };

    case "create_thread":
      return {
        id,
        type: "create_thread",
        channelId: obj.channel_id as string | undefined,
        name: (obj.name as string) ?? "",
        threadType: obj.thread_type as string | undefined,
        autoArchive: obj.auto_archive as string | undefined,
      };

    case "set_variable":
      return {
        id,
        type: "set_variable",
        varType: (obj.var_type as string) ?? "",
        varName: (obj.var_name as string) ?? "",
        value: (obj.value as string) ?? "",
      };

    case "delete_message":
      return {
        id,
        type: "delete_message",
        messageId: obj.message_id as string | undefined,
      };

    case "stop":
      return {
        id,
        type: "stop",
        content: (obj.content as string) ?? "",
        hidden: obj.hidden === true,
        silent: obj.silent === true,
        hideEmbeds: obj.hide_embeds === true,
      };

    default:
      return null;
  }
}
