"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  BarChart3,
  Palette,
  LayoutGrid,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DynamicStatsCardConfig, StatCardConfig, GraphConfig } from "./types";
import { StatsCardPreview } from "./stats-card-preview";

interface StatsCardEditorProps {
  item: DynamicStatsCardConfig | undefined;
  onChange: (config: DynamicStatsCardConfig) => void;
}

const AVAILABLE_ELEMENTS = [
  { value: "member_count", label: "Member Count", icon: "👥" },
  { value: "online_count", label: "Online Count", icon: "🟢" },
  { value: "total_messages", label: "Total Messages", icon: "💬" },
  { value: "total_events", label: "Total Events", icon: "📅" },
  { value: "voice_minutes", label: "Voice Minutes", icon: "🎙️" },
];

const GRAPH_TYPES = [
  { value: "line", label: "Line" },
  { value: "bar", label: "Bar" },
  { value: "area", label: "Area" },
];

const TIME_RANGES = [
  { value: "7d", label: "7 Days" },
  { value: "14d", label: "14 Days" },
  { value: "30d", label: "30 Days" },
];

const FORMAT_OPTIONS = [
  { value: "number", label: "Number" },
  { value: "compact", label: "Compact (1.2K)" },
  { value: "percent", label: "Percent" },
];

const DEFAULT_STATS: StatCardConfig[] = [
  { element: "member_count", label: "Members", format: "compact" },
  { element: "online_count", label: "Online", format: "number" },
];

function defaultConfig(): DynamicStatsCardConfig {
  return {
    layout: "standard",
    width: 600,
    height: 400,
    backgroundColor: "#1a1a2e",
    textColor: "#ffffff",
    accentColor: "#5865F2",
    borderRadius: 12,
    showTitle: true,
    title: "Server Statistics",
    titleSize: 24,
    showTimestamp: true,
    footerText: "",
    stats: DEFAULT_STATS,
    showGraph: true,
    graphType: "line",
    graphTimeRange: "30d",
    graphColor: "#5865F2",
  };
}

// ── Reusable UI Pieces ────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  open,
  onToggle,
  trailing,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(); } }}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2b2d31] transition-colors rounded-lg group cursor-pointer select-none"
    >
      <div className="w-8 h-8 rounded-md bg-[#5865F2]/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#5865F2]" />
      </div>
      <div className="flex-1 text-left">
        <span className="text-sm font-semibold text-[#DBDEE1]">{title}</span>
        {subtitle && (
          <span className="text-xs text-[#80848E] ml-2">{subtitle}</span>
        )}
      </div>
      {trailing && <div onClick={(e) => e.stopPropagation()}>{trailing}</div>}
      {open ? (
        <ChevronDown className="w-4 h-4 text-[#80848E]" />
      ) : (
        <ChevronRight className="w-4 h-4 text-[#80848E]" />
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-[#B5BAC1] uppercase tracking-wide mb-1.5">
      {children}
    </label>
  );
}

function FieldInput({
  value,
  onChange,
  type = "text",
  placeholder,
  className,
  min,
  max,
}: {
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      className={cn(
        "w-full bg-[#1E1F22] text-[#DBDEE1] border-none rounded-[3px] px-3 py-2 text-sm outline-none transition-all placeholder:text-[#80848E] focus:ring-1 focus:ring-[#5865F2]",
        className
      )}
    />
  );
}

function FieldSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[#1E1F22] text-[#DBDEE1] border-none rounded-[3px] px-3 py-2 text-sm outline-none cursor-pointer hover:bg-[#232428] transition-colors"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="w-9 h-9 rounded-md border-2 border-[#3f4147] cursor-pointer transition-colors hover:border-[#5865F2]"
            style={{ backgroundColor: value }}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-[#1E1F22] text-[#DBDEE1] border-none rounded-[3px] px-3 py-2 text-sm font-mono outline-none focus:ring-1 focus:ring-[#5865F2]"
        />
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 group"
    >
      <div
        className={cn(
          "w-10 h-5 rounded-full transition-colors relative",
          checked ? "bg-[#5865F2]" : "bg-[#4E5058]"
        )}
      >
        <div
          className={cn(
            "w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform shadow-sm",
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </div>
      <span className="text-sm text-[#B5BAC1] group-hover:text-[#DBDEE1] transition-colors">
        {label}
      </span>
    </button>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function StatsCardEditor({ item, onChange }: StatsCardEditorProps) {
  const base = item ?? defaultConfig();
  const [config, setConfig] = useState<DynamicStatsCardConfig>(base);
  const [openSections, setOpenSections] = useState({
    style: true,
    stats: true,
    graph: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateConfig = (updates: Partial<DynamicStatsCardConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onChange(newConfig);
  };

  const updateStats = (newStats: StatCardConfig[]) => {
    updateConfig({ stats: newStats });
  };

  const updateGraph = (updates: Partial<GraphConfig>) => {
    updateConfig({
      showGraph: updates.show ?? config.showGraph,
      graphType: updates.type ?? config.graphType,
      graphTimeRange: updates.timeRange ?? config.graphTimeRange,
      graphColor: updates.color ?? config.graphColor,
    });
  };

  const addStat = () => {
    updateStats([
      ...config.stats,
      { element: "member_count", label: "New Stat", format: "number" },
    ]);
  };

  const removeStat = (index: number) => {
    updateStats(config.stats.filter((_, i) => i !== index));
  };

  const updateStat = (index: number, updates: Partial<StatCardConfig>) => {
    const newStats = config.stats.map((s, i) =>
      i === index ? { ...s, ...updates } : s
    );
    updateStats(newStats);
  };

  const moveStat = (from: number, to: number) => {
    if (to < 0 || to >= config.stats.length) return;
    const newStats = [...config.stats];
    const [moved] = newStats.splice(from, 1);
    newStats.splice(to, 0, moved);
    updateStats(newStats);
  };

  return (
    <div className="space-y-2">
      {/* Preview — sticky at top */}
      <div className="flex justify-center pb-3 border-b border-[#3f4147]">
        <StatsCardPreview item={config} />
      </div>

      {/* ── Card Style Section ──────────────────────────────────────────── */}
      <div className="rounded-lg bg-[#2b2d31]/50">
        <SectionHeader
          icon={Palette}
          title="Card Style"
          subtitle={`${config.width}x${config.height}`}
          open={openSections.style}
          onToggle={() => toggleSection("style")}
        />
        {openSections.style && (
          <div className="px-4 pb-4 space-y-4">
            {/* Title & Layout */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <FieldLabel>Card Title</FieldLabel>
                <FieldInput
                  value={config.title}
                  onChange={(v) => updateConfig({ title: v })}
                  placeholder="Server Statistics"
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Layout</FieldLabel>
                <FieldSelect
                  value={config.layout}
                  onChange={(v) => updateConfig({ layout: v as DynamicStatsCardConfig["layout"] })}
                  options={[
                    { value: "compact", label: "Compact" },
                    { value: "standard", label: "Standard" },
                    { value: "detailed", label: "Detailed" },
                  ]}
                />
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <FieldLabel>Width</FieldLabel>
                <FieldInput
                  type="number"
                  value={config.width}
                  onChange={(v) => updateConfig({ width: parseInt(v) || 600 })}
                  min={200}
                  max={1200}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Height</FieldLabel>
                <FieldInput
                  type="number"
                  value={config.height}
                  onChange={(v) => updateConfig({ height: parseInt(v) || 400 })}
                  min={150}
                  max={800}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Corner Radius</FieldLabel>
                <FieldInput
                  type="number"
                  value={config.borderRadius}
                  onChange={(v) => updateConfig({ borderRadius: parseInt(v) || 0 })}
                  min={0}
                  max={48}
                />
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-3 gap-3">
              <ColorField
                label="Background"
                value={config.backgroundColor ?? "#1a1a2e"}
                onChange={(v) => updateConfig({ backgroundColor: v })}
              />
              <ColorField
                label="Text"
                value={config.textColor ?? "#ffffff"}
                onChange={(v) => updateConfig({ textColor: v })}
              />
              <ColorField
                label="Accent"
                value={config.accentColor ?? "#5865F2"}
                onChange={(v) => updateConfig({ accentColor: v })}
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-4 pt-1">
              <Toggle
                checked={config.showTitle}
                onChange={(v) => updateConfig({ showTitle: v })}
                label="Show title"
              />
              <Toggle
                checked={config.showTimestamp}
                onChange={(v) => updateConfig({ showTimestamp: v })}
                label="Show timestamp"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Statistics Section ───────────────────────────────────────────── */}
      <div className="rounded-lg bg-[#2b2d31]/50">
        <SectionHeader
          icon={LayoutGrid}
          title="Statistics"
          subtitle={`${config.stats.length} stat${config.stats.length !== 1 ? "s" : ""}`}
          open={openSections.stats}
          onToggle={() => toggleSection("stats")}
          trailing={
            <button
              type="button"
              onClick={addStat}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#5865F2]/10 text-[#5865F2] text-xs font-medium hover:bg-[#5865F2]/20 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          }
        />
        {openSections.stats && (
          <div className="px-4 pb-4 space-y-2">
            {config.stats.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-[#80848E]">No statistics added yet</p>
                <button
                  type="button"
                  onClick={addStat}
                  className="mt-2 text-xs text-[#5865F2] hover:underline"
                >
                  Add your first stat
                </button>
              </div>
            )}
            {config.stats.map((stat, index) => {
              const elInfo = AVAILABLE_ELEMENTS.find(
                (e) => e.value === stat.element
              );
              return (
                <div
                  key={index}
                  className="rounded-lg bg-[#1E1F22] border border-[#3f4147] overflow-hidden group"
                >
                  {/* Stat header */}
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-[#3f4147]/50">
                    <div className="flex flex-col gap-0.5 cursor-grab opacity-0 group-hover:opacity-60 transition-opacity">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveStat(index, index - 1)}
                          className="text-[#80848E] hover:text-white text-[10px] leading-none"
                        >
                          ▲
                        </button>
                      )}
                      {index < config.stats.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveStat(index, index + 1)}
                          className="text-[#80848E] hover:text-white text-[10px] leading-none"
                        >
                          ▼
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-[#80848E]">
                      {elInfo?.icon ?? "📊"}
                    </span>
                    <span className="text-sm text-[#DBDEE1] font-medium flex-1">
                      {stat.label || "Untitled"}
                    </span>
                    <span className="text-[10px] text-[#14b8a6] font-mono bg-[#14b8a6]/10 px-1.5 py-0.5 rounded">
                      {stat.element}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStat(index)}
                      className="text-[#80848E] hover:text-[#F23F42] transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {/* Stat fields */}
                  <div className="grid grid-cols-3 gap-3 p-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#80848E] uppercase tracking-wide">
                        Element
                      </label>
                      <select
                        value={stat.element}
                        onChange={(e) =>
                          updateStat(index, {
                            element: e.target.value,
                            label:
                              AVAILABLE_ELEMENTS.find(
                                (el) => el.value === e.target.value
                              )?.label ?? stat.label,
                          })
                        }
                        className="w-full bg-[#2b2d31] text-[#DBDEE1] border-none rounded-[3px] px-2 py-1.5 text-xs outline-none cursor-pointer"
                      >
                        {AVAILABLE_ELEMENTS.map((el) => (
                          <option key={el.value} value={el.value}>
                            {el.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#80848E] uppercase tracking-wide">
                        Label
                      </label>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) =>
                          updateStat(index, { label: e.target.value })
                        }
                        className="w-full bg-[#2b2d31] text-[#DBDEE1] border-none rounded-[3px] px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-[#5865F2]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#80848E] uppercase tracking-wide">
                        Format
                      </label>
                      <select
                        value={stat.format}
                        onChange={(e) =>
                          updateStat(index, {
                            format: e.target.value as StatCardConfig["format"],
                          })
                        }
                        className="w-full bg-[#2b2d31] text-[#DBDEE1] border-none rounded-[3px] px-2 py-1.5 text-xs outline-none cursor-pointer"
                      >
                        {FORMAT_OPTIONS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Graph Section ────────────────────────────────────────────────── */}
      <div className="rounded-lg bg-[#2b2d31]/50">
        <SectionHeader
          icon={BarChart3}
          title="Graph"
          subtitle={config.showGraph ? `${config.graphType} / ${config.graphTimeRange}` : "Hidden"}
          open={openSections.graph}
          onToggle={() => toggleSection("graph")}
          trailing={
            <button
              type="button"
              onClick={() => updateGraph({ show: !config.showGraph })}
              className={cn(
                "p-1 rounded transition-colors",
                config.showGraph
                  ? "text-[#5865F2] hover:bg-[#5865F2]/10"
                  : "text-[#80848E] hover:bg-[#80848E]/10"
              )}
            >
              {config.showGraph ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          }
        />
        {openSections.graph && config.showGraph && (
          <div className="px-4 pb-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <FieldLabel>Chart Type</FieldLabel>
                <FieldSelect
                  value={config.graphType}
                  onChange={(v) =>
                    updateGraph({ type: v as GraphConfig["type"] })
                  }
                  options={GRAPH_TYPES}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel>Time Range</FieldLabel>
                <FieldSelect
                  value={config.graphTimeRange}
                  onChange={(v) =>
                    updateGraph({
                      timeRange: v as GraphConfig["timeRange"],
                    })
                  }
                  options={TIME_RANGES}
                />
              </div>
              <ColorField
                label="Color"
                value={config.graphColor ?? "#5865F2"}
                onChange={(v) => updateGraph({ color: v })}
              />
            </div>
          </div>
        )}
        {openSections.graph && !config.showGraph && (
          <div className="px-4 pb-4">
            <p className="text-xs text-[#80848E]">
              Graph is hidden. Click the eye icon to enable it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
