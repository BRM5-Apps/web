"use client";

import { useEffect, useState } from "react";
import { X, Cpu } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { StatsCardEditor } from "./stats-card-editor";
import { GraphWorkbench } from "./graph-workbench";
import type {
  DynamicStatsCardConfig,
  CardStyleConfig,
  GraphConfig,
  StatCardConfig,
} from "./types";

// Detect and migrate old card shape { config, stats, graph } to flat DynamicStatsCardConfig
type OldStatCardShape = {
  config: CardStyleConfig;
  stats: StatCardConfig[];
  graph?: GraphConfig;
};

function isOldShape(val: unknown): val is OldStatCardShape {
  return !!(val && typeof val === "object" && "config" in val && "stats" in val);
}

function migrateToNewFormat(
  card: DynamicStatsCardConfig | OldStatCardShape
): DynamicStatsCardConfig {
  if (isOldShape(card)) {
    return {
      layout: card.config.layout,
      width: card.config.width,
      height: card.config.height,
      backgroundColor: card.config.backgroundColor,
      textColor: card.config.textColor,
      accentColor: card.config.accentColor,
      borderRadius: card.config.borderRadius,
      showTitle: card.config.showTitle,
      title: card.config.title,
      titleSize: card.config.titleSize,
      showTimestamp: card.config.showTimestamp,
      footerText: card.config.footerText,
      stats: card.stats,
      showGraph: card.graph?.show ?? true,
      graphType:
        (card.graph?.type as DynamicStatsCardConfig["graphType"]) ?? "line",
      graphTimeRange:
        (card.graph?.timeRange as DynamicStatsCardConfig["graphTimeRange"]) ??
        "30d",
      graphColor: card.graph?.color ?? "#5865F2",
    };
  }
  return card;
}

interface StatsCardEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statCard: DynamicStatsCardConfig | undefined;
  onChange: (statCard: DynamicStatsCardConfig) => void;
  serverId?: string;
}

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
    stats: [
      { element: "member_count", label: "Members", format: "compact" },
      { element: "online_count", label: "Online", format: "number" },
    ],
    showGraph: true,
    graphType: "line",
    graphTimeRange: "30d",
    graphColor: "#5865F2",
  };
}

export function StatsCardEditDialog({
  open,
  onOpenChange,
  statCard,
  onChange,
  serverId,
}: StatsCardEditDialogProps) {
  const [config, setConfig] = useState<DynamicStatsCardConfig>(
    statCard ? migrateToNewFormat(statCard) : defaultConfig()
  );
  const [graphWorkbenchOpen, setGraphWorkbenchOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setConfig(statCard ? migrateToNewFormat(statCard) : defaultConfig());
    }
  }, [open, statCard]);

  const hasAdvancedConfig = !!(config.computation || config.bindings);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-[720px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-[#313338] text-white p-0 overflow-hidden shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#3f4147]">
            <div>
              <DialogPrimitive.Title className="text-lg font-bold text-white">
                Edit Stats Card
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-xs text-[#B5BAC1] mt-0.5">
                Configure the dynamic statistics card for your media gallery
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="text-[#80848E] hover:text-[#DBDEE1] transition-colors p-1">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          {/* Body */}
          <div className="max-h-[70vh] overflow-y-auto px-5 py-4 discord-scroll">
            <StatsCardEditor
              item={config}
              onChange={(c) => setConfig(c)}
            />

            {/* Graph Workbench section at bottom */}
            <div className="mt-4 rounded-lg bg-[#2b2d31] border border-[#3f4147] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#5865F2]/10 flex items-center justify-center shrink-0">
                    <Cpu className="w-4 h-4 text-[#5865F2]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#DBDEE1]">
                      Advanced: Graph Workbench
                    </h3>
                    <p className="text-xs text-[#80848E]">
                      Define computation logic and bind dynamic values to stats
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setGraphWorkbenchOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#5865F2]/10 text-[#5865F2] text-xs font-medium hover:bg-[#5865F2]/20 transition-colors"
                >
                  <Cpu className="w-3 h-3" />
                  Open
                </button>
              </div>
              {hasAdvancedConfig && (
                <div className="mt-2.5 flex items-center gap-2 text-xs text-[#14b8a6] pl-11">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
                  Computation graph configured
                  <span className="text-[#80848E]">
                    &middot; {config.computation?.nodes?.length ?? 0} node
                    {(config.computation?.nodes?.length ?? 0) !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#2B2D31] px-5 py-3 flex items-center justify-end gap-3 border-t border-[#3f4147]">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-[3px] text-sm font-medium text-white hover:underline"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(config);
                onOpenChange(false);
              }}
              className="px-4 py-2 rounded-[3px] text-sm font-medium bg-[#5865F2] text-white hover:bg-[#4752C4] active:bg-[#3C45A5] transition-colors min-w-[96px]"
            >
              Save
            </button>
          </div>

          {/* Graph Workbench overlay */}
          <GraphWorkbench
            open={graphWorkbenchOpen}
            onOpenChange={setGraphWorkbenchOpen}
            graph={config.computation}
            bindings={config.bindings}
            stats={config.stats}
            serverId={serverId}
            onSave={({ computation, bindings }) => {
              const next = { ...config, computation, bindings };
              setConfig(next);
              onChange(next);
            }}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
