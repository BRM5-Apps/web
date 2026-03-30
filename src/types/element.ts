export type ElementType =
  | "SYSTEM"
  | "USER"
  | "SERVER"
  | "RANK"
  | "MODULE_FIELD"
  | "CUSTOM_COUNTER"
  | "CUSTOM_VARIABLE"
  | "STATIC"
  | "DISCORD_ROLE"
  | "DISCORD_CHANNEL"
  | "DISCORD_USER"
  | "DISCORD_AUDIT"
  | "SERVER_STAT"
  | "DYNAMIC_STATS_CARD"
  | "ROBLOX_USER"
  | "ROBLOX_GROUP"
  | "VERIFICATION";

export interface CustomVariable {
  id: string;
  name: string;
  key: string;
  defaultValue?: string;
  description?: string;
  scope: "global" | "user" | "session";
  createdAt: string;
  updatedAt: string;
}

export interface ElementCounterMeta {
  current_value: number;
  reset_schedule: string;
  increment_events?: string[];
}

export interface ElementCatalogItem {
  id: string;
  name: string;
  variable_key: string;
  element_type: ElementType;
  description: string;
  category: string;
  source: string;
  insertions: string[];
  config: Record<string, unknown>;
  counter_meta?: ElementCounterMeta;
}

export interface ResolveElementsResponse {
  input: string;
  resolved: string;
  resolved_keys: string[];
}
