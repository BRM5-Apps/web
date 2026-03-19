export type ElementType =
  | "SYSTEM"
  | "USER"
  | "SERVER"
  | "RANK"
  | "MODULE_FIELD"
  | "CUSTOM_COUNTER"
  | "STATIC";

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
