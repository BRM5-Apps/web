"use client";

import { cn } from "@/lib/utils";
import { X, ChevronDown } from "lucide-react";
import type {
  StatCardConfig,
  StatsCardValueSource,
  StatsCardBindingConfig,
} from "./types";

interface BindingsEditorProps {
  stats: StatCardConfig[];
  bindings: StatsCardBindingConfig | undefined;
  onChange: (bindings: StatsCardBindingConfig) => void;
}

const SERVER_STAT_KEYS = [
  { value: "total_members", label: "Total Members" },
  { value: "active_members", label: "Active Members" },
  { value: "online_count", label: "Online Count" },
  { value: "member_count", label: "Member Count" },
  { value: "total_messages", label: "Total Messages" },
  { value: "total_events", label: "Total Events" },
  { value: "voice_minutes", label: "Voice Minutes" },
];

const SOURCE_TYPES = [
  { value: "server_stat", label: "Server Stat", color: "#5865F2" },
  { value: "element", label: "Element", color: "#14b8a6" },
  { value: "variable", label: "Variable", color: "#f59e0b" },
  { value: "literal", label: "Literal", color: "#80848E" },
];

function createEmptyBindings(stats: StatCardConfig[]): StatsCardBindingConfig {
  const statsEntries: Record<string, StatBindingEntry> = {};
  for (const stat of stats) {
    statsEntries[stat.element] = {
      value: { type: "server_stat", key: stat.element },
    };
  }
  return { stats: statsEntries };
}

interface StatBindingEntry {
  value: StatsCardValueSource;
  color?: StatsCardValueSource;
}

function getBinding(
  bindings: StatsCardBindingConfig | undefined,
  element: string
): StatBindingEntry | undefined {
  if (!bindings?.stats) return undefined;
  return bindings.stats[element] as StatBindingEntry | undefined;
}

export function BindingsEditor({
  stats,
  bindings,
  onChange,
}: BindingsEditorProps) {
  // Ensure bindings has an entry for every stat
  const normalizedBindings: StatsCardBindingConfig = bindings
    ? { ...bindings }
    : createEmptyBindings(stats);

  if (!normalizedBindings.stats) {
    normalizedBindings.stats = {};
  }

  // Ensure every stat has a binding entry
  for (const stat of stats) {
    if (!normalizedBindings.stats![stat.element]) {
      normalizedBindings.stats![stat.element] = {
        value: { type: "server_stat", key: stat.element },
      };
    }
  }

  function updateStatBinding(
    element: string,
    field: "value" | "color",
    source: StatsCardValueSource | undefined
  ) {
    const entry = normalizedBindings.stats![element] ?? {
      value: { type: "server_stat", key: element },
    };
    const newEntry =
      field === "value"
        ? { ...entry, value: source! }
        : { ...entry, color: source };
    normalizedBindings.stats![element] = newEntry as any;
    onChange({ ...normalizedBindings });
  }

  if (stats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-[#2b2d31] flex items-center justify-center mb-3">
          <span className="text-xl">📊</span>
        </div>
        <p className="text-sm font-medium text-[#DBDEE1]">No stats to bind</p>
        <p className="text-xs text-[#80848E] mt-1">
          Add stats in the Design tab first, then configure their data bindings
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {stats.map((stat) => {
        const binding = getBinding(normalizedBindings, stat.element);
        const valueSource = binding?.value ?? {
          type: "server_stat",
          key: stat.element,
        };
        const colorSource = binding?.color;

        return (
          <div
            key={stat.element}
            className="rounded-lg bg-[#2b2d31] border border-[#3f4147] overflow-hidden"
          >
            {/* Stat header */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#3f4147]/50">
              <span className="text-sm font-medium text-[#DBDEE1]">
                {stat.label}
              </span>
              <span className="text-[10px] text-[#14b8a6] font-mono bg-[#14b8a6]/10 px-1.5 py-0.5 rounded">
                {stat.element}
              </span>
            </div>

            <div className="px-4 py-3 space-y-3">
              {/* Value source */}
              <div>
                <label className="text-[10px] font-bold text-[#80848E] uppercase tracking-wide mb-1.5 block">
                  Value Source
                </label>
                <ValueSourceEditor
                  value={valueSource}
                  onChange={(vs) =>
                    updateStatBinding(stat.element, "value", vs)
                  }
                />
              </div>

              {/* Color source (optional) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-bold text-[#80848E] uppercase tracking-wide">
                    Color Override
                  </label>
                  {colorSource ? (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatBinding(stat.element, "color", undefined)
                      }
                      className="flex items-center gap-1 text-[10px] text-[#F23F42] hover:text-[#F23F42]/80 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatBinding(stat.element, "color", {
                          type: "literal",
                          value: "#5865F2",
                        })
                      }
                      className="text-[10px] text-[#5865F2] hover:text-[#5865F2]/80 transition-colors"
                    >
                      + Add color binding
                    </button>
                  )}
                </div>
                {colorSource && (
                  <ValueSourceEditor
                    value={colorSource}
                    onChange={(vs) =>
                      updateStatBinding(stat.element, "color", vs)
                    }
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Value Source Editor ────────────────────────────────────────────────────────

interface ValueSourceEditorProps {
  value: StatsCardValueSource | undefined;
  onChange: (vs: StatsCardValueSource) => void;
}

function ValueSourceEditor({ value, onChange }: ValueSourceEditorProps) {
  const type = value?.type ?? "server_stat";
  const sourceInfo = SOURCE_TYPES.find((s) => s.value === type);

  return (
    <div className="flex gap-2">
      {/* Type selector */}
      <div className="relative shrink-0">
        <select
          value={type}
          onChange={(e) => {
            const newType = e.target.value as StatsCardValueSource["type"];
            if (newType === "server_stat") {
              onChange({ type: "server_stat", key: "total_members" });
            } else if (newType === "element") {
              onChange({ type: "element", key: "" });
            } else if (newType === "variable") {
              onChange({ type: "variable", key: "" });
            } else {
              onChange({ type: "literal", value: 0 });
            }
          }}
          className="appearance-none bg-[#1E1F22] text-[#DBDEE1] rounded-md pl-3 pr-7 py-2 text-xs font-medium outline-none cursor-pointer hover:bg-[#232428] transition-colors border border-[#3f4147] focus:border-[#5865F2]"
          style={{
            borderLeftColor: sourceInfo?.color ?? "#3f4147",
            borderLeftWidth: "3px",
          }}
        >
          {SOURCE_TYPES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-[#80848E] pointer-events-none" />
      </div>

      {/* Value input */}
      <div className="flex-1">
        {type === "server_stat" && (
          <div className="relative">
            <select
              value={(value as any)?.key ?? "total_members"}
              onChange={(e) =>
                onChange({ type: "server_stat", key: e.target.value })
              }
              className="w-full appearance-none bg-[#1E1F22] text-[#DBDEE1] rounded-md pl-3 pr-7 py-2 text-xs outline-none cursor-pointer hover:bg-[#232428] transition-colors border border-[#3f4147] focus:border-[#5865F2]"
            >
              {SERVER_STAT_KEYS.map((k) => (
                <option key={k.value} value={k.value}>
                  {k.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-[#80848E] pointer-events-none" />
          </div>
        )}

        {type === "element" && (
          <input
            type="text"
            value={(value as any)?.key ?? ""}
            onChange={(e) => onChange({ type: "element", key: e.target.value })}
            placeholder="e.g. total_members or any element key"
            className="w-full bg-[#1E1F22] text-[#DBDEE1] rounded-md px-3 py-2 text-xs outline-none border border-[#3f4147] focus:border-[#5865F2] transition-colors placeholder:text-[#4E5058] font-mono"
          />
        )}

        {type === "variable" && (
          <input
            type="text"
            value={(value as any)?.key ?? ""}
            onChange={(e) =>
              onChange({ type: "variable", key: e.target.value })
            }
            placeholder="variable_name"
            className="w-full bg-[#1E1F22] text-[#DBDEE1] rounded-md px-3 py-2 text-xs outline-none border border-[#3f4147] focus:border-[#5865F2] transition-colors placeholder:text-[#4E5058] font-mono"
          />
        )}

        {type === "literal" && (
          <input
            type="text"
            value={(value as any)?.value ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              const num = parseFloat(v);
              onChange({ type: "literal", value: isNaN(num) ? v : num });
            }}
            placeholder='0 or "string"'
            className="w-full bg-[#1E1F22] text-[#DBDEE1] rounded-md px-3 py-2 text-xs outline-none border border-[#3f4147] focus:border-[#5865F2] transition-colors placeholder:text-[#4E5058]"
          />
        )}
      </div>
    </div>
  );
}
