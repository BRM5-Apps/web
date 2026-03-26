"use client";

import { useEffect, useRef } from "react";
import type { DynamicStatsCardConfig, StatCardConfig, GraphConfig, ActionGraphDocument } from "./types";
import { evaluateExpression } from "./expression-evaluator";

interface ResolvedStat {
  element: string;
  label: string;
  format: string;
  value: number;
  color: string;
}

// Legacy props support
type LegacyProps = {
  config: DynamicStatsCardConfig["layout"] extends string ? DynamicStatsCardConfig : never;
  stats?: never;
  graph?: never;
  item?: never;
};

// New unified props
type PreviewProps = (
  | { item: DynamicStatsCardConfig; config?: never; stats?: never; graph?: never }
  | { item?: never; config: DynamicStatsCardConfig; stats: StatCardConfig[]; graph: GraphConfig }
);

type StatsCardPreviewProps = PreviewProps;

const PLACEHOLDER_VALUES: Record<string, number> = {
  member_count: 1234,
  total_members: 1234,
  online_count: 347,
  active_members: 347,
  total_messages: 52800,
  total_events: 89,
  voice_minutes: 14200,
};

function formatValue(value: number, format: string): string {
  switch (format) {
    case "compact":
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
      return String(value);
    case "percent":
      return `${value}%`;
    default:
      return String(value);
  }
}

// Simple fake graph data for preview
function generateFakeGraphData(points: number): number[] {
  const data: number[] = [];
  let val = 50;
  for (let i = 0; i < points; i++) {
    val += Math.sin(i * 0.5) * 10 + (Math.random() - 0.5) * 8;
    data.push(Math.max(0, val));
  }
  return data;
}

// ── Computation Simulation ───────────────────────────────────────────────────

type MockVariables = Record<string, number | string | boolean>;

function resolveValueSource(
  vs: { type: string; key?: string; value?: number | string } | undefined,
  serverStats: Record<string, number>,
  vars: MockVariables
): number | string {
  if (!vs) return 0;
  switch (vs.type) {
    case "server_stat":
      return serverStats[vs.key ?? ""] ?? 0;
    case "variable": {
      const v = vars[vs.key ?? ""];
      if (typeof v === "boolean") return v ? 1 : 0;
      return v ?? 0;
    }
    case "literal":
      return vs.value ?? 0;
    default:
      return 0;
  }
}

function executeComputationGraph(
  doc: ActionGraphDocument,
  serverStats: Record<string, number>
): MockVariables {
  const variables: MockVariables = {};
  const visited: Record<string, number> = {};

  // Build adjacency
  const outgoing: Record<string, typeof doc.edges> = {};
  for (const edge of doc.edges) {
    if (!outgoing[edge.source]) outgoing[edge.source] = [];
    outgoing[edge.source].push(edge);
  }

  // Find node by id
  const nodeMap = new Map(doc.nodes.map((n) => [n.id, n]));

  function walk(nodeId: string): void {
    if (!nodeId) return;
    const count = visited[nodeId] ?? 0;
    if (count > 1000) return; // Safety limit
    visited[nodeId] = count + 1;

    const node = nodeMap.get(nodeId);
    if (!node) return;

    if (node.kind === "action" && node.action) {
      switch (node.action.type) {
        case "set_variable": {
          try {
            const val = evaluateExpression(
              node.action.value ?? "",
              serverStats,
              variables
            );
            variables[node.action.varName ?? ""] = val as number | string | boolean;
          } catch {
            // Expression evaluation failed — skip variable
          }
          break;
        }
        case "stop":
          return;
      }

      // Follow next edges
      const edges = outgoing[nodeId] ?? [];
      for (const edge of edges) {
        if (edge.kind === "next") walk(edge.target);
      }
    } else if (node.kind === "condition") {
      const cond = (node as any).condition;
      let result = true;

      if (cond) {
        const leftVal = resolveValueSource(cond.left, serverStats, variables);
        const rightVal = resolveValueSource(cond.right, serverStats, variables);
        const l = typeof leftVal === "number" ? leftVal : parseFloat(leftVal as string) || 0;
        const r = typeof rightVal === "number" ? rightVal : parseFloat(rightVal as string) || 0;

        switch (cond.operator) {
          case "greater_than":
            result = l > r;
            break;
          case "less_than":
            result = l < r;
            break;
          case "greater_than_or_equal":
            result = l >= r;
            break;
          case "less_than_or_equal":
            result = l <= r;
            break;
          case "equal":
            result = l === r;
            break;
          case "not_equal":
            result = l !== r;
            break;
          case "and":
            result = true;
            break;
          case "or":
            result = false;
            break;
          default:
            result = true;
        }
      }

      const branch = result ? "pass" : "fail";
      const edges = outgoing[nodeId] ?? [];

      // Walk chosen branch
      for (const edge of edges) {
        if (edge.kind === branch) walk(edge.target);
      }
      // Walk next edges
      for (const edge of edges) {
        if (edge.kind === "next") walk(edge.target);
      }
    }
  }

  walk(doc.entry_node_id ?? "");
  return variables;
}

function resolveStatBindings(
  stats: StatCardConfig[],
  bindings: DynamicStatsCardConfig["bindings"],
  serverStats: Record<string, number>,
  variables: MockVariables
): ResolvedStat[] {
  return stats.map((stat) => {
    let value = PLACEHOLDER_VALUES[stat.element] ?? 0;
    let color = stat.color ?? "#5865F2";

    if (bindings?.stats?.[stat.element]) {
      const binding = bindings.stats[stat.element];
      if (binding.value) {
        const resolved = resolveValueSource(binding.value, serverStats, variables);
        value = typeof resolved === "number" ? resolved : parseFloat(resolved as string) || 0;
      }
      if (binding.color) {
        const resolved = resolveValueSource(binding.color, serverStats, variables);
        if (typeof resolved === "string" && resolved.startsWith("#")) {
          color = resolved;
        }
      }
    }

    return {
      element: stat.element,
      label: stat.label,
      format: stat.format,
      value,
      color,
    };
  });
}

// ── Render Function ──────────────────────────────────────────────────────────

function renderCanvas(
  canvas: HTMLCanvasElement,
  config: DynamicStatsCardConfig,
  resolvedStats: ResolvedStat[]
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = config.width || 600;
  const h = config.height || 400;
  canvas.width = w;
  canvas.height = h;

  // Background
  ctx.fillStyle = config.backgroundColor || "#1a1a2e";
  const r = Math.min(config.borderRadius || 0, 24);
  if (r > 0) {
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, r);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, w, h);
  }

  let yOffset = 20;

  // Title
  if (config.showTitle && config.title) {
    const titleSize = config.titleSize || 24;
    ctx.fillStyle = config.textColor || "#ffffff";
    ctx.font = `bold ${titleSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(config.title, w / 2, yOffset + titleSize);
    yOffset += titleSize + 20;
  }

  // Stats rows
  ctx.textAlign = "left";
  for (const stat of resolvedStats) {
    const formatted = formatValue(stat.value, stat.format);

    ctx.fillStyle = config.textColor || "#ffffff";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${stat.label}:`, 20, yOffset + 14);

    ctx.fillStyle = stat.color || config.accentColor || "#5865F2";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(formatted, w - 20, yOffset + 20);

    yOffset += 40;
  }

  // Graph
  if (config.showGraph) {
    const graphHeight = Math.floor(h / 4);
    const graphY = h - graphHeight - 20;
    const graphX = 10;
    const graphW = w - 20;

    const points =
      config.graphTimeRange === "7d" ? 7 : config.graphTimeRange === "14d" ? 14 : 30;
    const data = generateFakeGraphData(points);
    const maxVal = Math.max(...data, 1);

    ctx.strokeStyle = config.graphColor || "#5865F2";
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < data.length; i++) {
      const px = graphX + (i / (data.length - 1)) * graphW;
      const py = graphY + graphHeight - (data[i] / maxVal) * graphHeight;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    ctx.stroke();
  }

  // Timestamp
  if (config.showTimestamp) {
    ctx.fillStyle = "#888888";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    const now = new Date();
    ctx.fillText(
      `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")} ${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")} UTC`,
      10,
      (config.height || 400) - 8,
    );
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export function StatsCardPreview(props: StatsCardPreviewProps) {
  // Support both { item: config } and { config, stats, graph }
  const item = props.item;
  const config: DynamicStatsCardConfig = item
    ? {
        layout: item.layout,
        width: item.width,
        height: item.height,
        backgroundColor: item.backgroundColor,
        textColor: item.textColor,
        accentColor: item.accentColor,
        borderRadius: item.borderRadius,
        showTitle: item.showTitle,
        title: item.title,
        titleSize: item.titleSize,
        showTimestamp: item.showTimestamp,
        footerText: item.footerText,
        stats: item.stats,
        showGraph: item.showGraph,
        graphType: item.graphType,
        graphTimeRange: item.graphTimeRange,
        graphColor: item.graphColor,
      }
    : {
        layout: props.config?.layout ?? "standard",
        width: props.config?.width ?? 600,
        height: props.config?.height ?? 400,
        backgroundColor: props.config?.backgroundColor ?? "#1a1a2e",
        textColor: props.config?.textColor ?? "#ffffff",
        accentColor: props.config?.accentColor ?? "#5865F2",
        borderRadius: props.config?.borderRadius ?? 12,
        showTitle: props.config?.showTitle ?? true,
        title: props.config?.title ?? "Server Statistics",
        titleSize: props.config?.titleSize ?? 24,
        showTimestamp: props.config?.showTimestamp ?? true,
        footerText: props.config?.footerText ?? "",
        stats: props.stats ?? [],
        showGraph: props.config?.showGraph ?? true,
        graphType: props.config?.graphType ?? "line",
        graphTimeRange: props.config?.graphTimeRange ?? "30d",
        graphColor: props.config?.graphColor ?? "#5865F2",
      };

  const stats: StatCardConfig[] = item?.stats ?? props.stats ?? [];
  const graph: GraphConfig = item
    ? {
        show: item.showGraph,
        type: item.graphType as GraphConfig["type"] ?? "line",
        timeRange: item.graphTimeRange as GraphConfig["timeRange"] ?? "30d",
        color: item.graphColor ?? "#5865F2",
      }
    : {
        show: props.graph?.show ?? true,
        type: props.graph?.type ?? "line",
        timeRange: props.graph?.timeRange ?? "30d",
        color: props.graph?.color ?? "#5865F2",
      };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isAdvancedMode = !!(item?.computation);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const serverStats = { ...PLACEHOLDER_VALUES };
    let resolvedStats: ResolvedStat[];

    if (isAdvancedMode && item?.computation) {
      // Simulate computation
      const variables = executeComputationGraph(item.computation, serverStats);
      resolvedStats = resolveStatBindings(stats, item.bindings, serverStats, variables);
    } else {
      // Legacy basic mode — use placeholder values
      resolvedStats = stats.map((stat) => ({
        element: stat.element,
        label: stat.label,
        format: stat.format,
        value: PLACEHOLDER_VALUES[stat.element] ?? 0,
        color: stat.color ?? "#5865F2",
      }));
    }

    // Build full config for rendering
    const renderConfig: DynamicStatsCardConfig = {
      ...config,
      showGraph: graph.show,
      graphType: graph.type,
      graphTimeRange: graph.timeRange,
      graphColor: graph.color,
    };

    renderCanvas(canvas, renderConfig, resolvedStats);
  }, [config, stats, graph, isAdvancedMode, item]);

  const scale = Math.min(1, 400 / (config.width || 600));

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {isAdvancedMode ? "Preview (simulated computation)" : "Preview (placeholder data)"}
      </p>
      <div
        className="overflow-hidden rounded-md border border-border"
        style={{
          width: (config.width || 600) * scale,
          height: (config.height || 400) * scale,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: (config.width || 600) * scale,
            height: (config.height || 400) * scale,
          }}
        />
      </div>
    </div>
  );
}
