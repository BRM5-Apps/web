"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ZoomIn,
  ZoomOut,
  MousePointer2,
  Trash2,
  Settings,
  Check,
  X,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  ActionGraphDocument,
  ActionGraphNode,
  FlowAction,
  FaSetVariable,
  FaCheck,
  StatCardConfig,
} from "./types";
import { ConditionBuilder, createDefaultCondition } from "./condition-builder";

interface Position {
  x: number;
  y: number;
}

type NodeData = ActionGraphNode & {
  position: Position;
};

interface ComputationGraphEditorProps {
  graph?: ActionGraphDocument;
  onChange: (graph: ActionGraphDocument) => void;
  stats?: StatCardConfig[];
}

// Only allowed action types in computation graphs
const ALLOWED_ACTIONS = ["do_nothing", "check", "set_variable", "stop"] as const;
type ComputationActionType = typeof ALLOWED_ACTIONS[number];

const ACTION_PALETTE = [
  { type: "do_nothing", label: "Do Nothing", icon: MousePointer2, color: "#6b7280" },
  { type: "check", label: "Check Condition", icon: Check, color: "#8b5cf6" },
  { type: "set_variable", label: "Set Variable", icon: Settings, color: "#14b8a6" },
  { type: "stop", label: "Stop Flow", icon: X, color: "#991b1b" },
] as const;

function uid(): string {
  return crypto.randomUUID();
}

function getEdgeColor(kind: "next" | "pass" | "fail"): string {
  switch (kind) {
    case "pass":
      return "#10b981";
    case "fail":
      return "#ef4444";
    case "next":
    default:
      return "#6b7280";
  }
}

function getEdgeLabel(kind: "next" | "pass" | "fail"): string {
  switch (kind) {
    case "pass":
      return "True";
    case "fail":
      return "False";
    case "next":
    default:
      return "";
  }
}

function makeAction(type: ComputationActionType): FlowAction {
  switch (type) {
    case "do_nothing":
      return { id: uid(), type: "do_nothing" };
    case "check":
      return { id: uid(), type: "check", condition: createDefaultCondition(), passBranch: [], failBranch: [] };
    case "set_variable":
      return { id: uid(), type: "set_variable", varType: "Dynamic", varName: "", value: "" };
    case "stop":
      return { id: uid(), type: "stop", content: "", hidden: false, silent: false, hideEmbeds: false };
  }
}

// ── Node geometry constants ────────────────────────────────────────────────
const NODE_WIDTH = 280;
// Input port sits at top of node body (inside header area)
const INPUT_PORT_Y_OFFSET = 0;
// Action node: header (48px) + body + ports
const ACTION_NODE_BODY_HEIGHT = 118;
// Condition node: header (48px) + condition preview + ports
const CONDITION_NODE_BODY_HEIGHT = 108;
// Output port y = bottom of node body
const OUTPUT_PORT_Y_OFFSET_ACTION = ACTION_NODE_BODY_HEIGHT;
const OUTPUT_PORT_Y_OFFSET_CONDITION = CONDITION_NODE_BODY_HEIGHT;

export function ComputationGraphEditor({ graph, onChange, stats = [] }: ComputationGraphEditorProps) {
  const initial: ActionGraphDocument = graph ?? {
    version: 1,
    entry_node_id: undefined,
    nodes: [],
    edges: [],
  };

  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });

  // Node dragging — use refs to avoid triggering re-renders during drag
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const dragOffsetRef = useRef<Position>({ x: 0, y: 0 });
  const dragNodePosRef = useRef<Position>({ x: 0, y: 0 });

  // Connection state
  const [connectingFrom, setConnectingFrom] = useState<{
    nodeId: string;
    kind: "next" | "pass" | "fail";
  } | null>(null);
  const [connectingMousePos, setConnectingMousePos] = useState<Position | null>(null);

  // Selection
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure all nodes have positions
  const nodesWithPositions = useMemo(() => {
    return initial.nodes.map((node, index) => ({
      ...node,
      position: (node as any).position || {
        x: 100 + (index % 3) * 300,
        y: 100 + Math.floor(index / 3) * 150,
      },
    }));
  }, [initial.nodes]);

  // ── Canvas Interactions ────────────────────────────────────────────────────

  const handleWheel = useCallback((e: React.WheelEvent) => {
    const target = e.target as HTMLElement;
    let el: HTMLElement | null = target;
    while (el) {
      const style = window.getComputedStyle(el);
      const isScrollable = style.overflow === "auto" || style.overflow === "scroll";
      const hasScrollableData = el.dataset.scrollable === "true" || el.getAttribute("data-radix-scroll-area-viewport") !== null;
      if (isScrollable || hasScrollableData) return;
      el = el.parentElement;
    }
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.min(Math.max(z * delta, 0.25), 3));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset?.canvas) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedNodeId(null);
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
    if (connectingFrom && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setConnectingMousePos({
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom,
      });
    }
    if (draggingNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom - dragOffsetRef.current.x;
      const y = (e.clientY - rect.top - pan.y) / zoom - dragOffsetRef.current.y;
      dragNodePosRef.current = { x, y };
      // Move the node DOM element directly — no re-render during drag
      const nodeEl = canvasRef.current.querySelector(`[data-node-id="${draggingNode}"]`) as HTMLElement | null;
      if (nodeEl) {
        nodeEl.style.left = `${x}px`;
        nodeEl.style.top = `${y}px`;
      }
    }
  }, [isPanning, panStart, connectingFrom, draggingNode, zoom, pan]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    if (draggingNode) {
      // Commit final position to state only on drag end
      updateNodePosition(draggingNode, dragNodePosRef.current);
    }
    setDraggingNode(null);
  }, [draggingNode]);

  // ── Node Operations ────────────────────────────────────────────────────────

  const updateNodePosition = useCallback((nodeId: string, position: Position) => {
    onChange({
      ...initial,
      nodes: initial.nodes.map((n) =>
        n.id === nodeId ? { ...n, position } : n
      ),
    });
  }, [initial, onChange]);

  const addNode = useCallback((type: ComputationActionType, position: Position) => {
    const newNode: ActionGraphNode =
      type === "check"
        ? { id: uid(), kind: "condition", position }
        : { id: uid(), kind: "action", action: makeAction(type), position };

    onChange({
      ...initial,
      nodes: [...initial.nodes, newNode],
      entry_node_id: initial.entry_node_id || newNode.id,
    });
  }, [initial, onChange]);

  const removeNode = useCallback((nodeId: string) => {
    onChange({
      ...initial,
      nodes: initial.nodes.filter((n) => n.id !== nodeId),
      edges: initial.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      entry_node_id: initial.entry_node_id === nodeId ? undefined : initial.entry_node_id,
    });
    setSelectedNodeId(null);
  }, [initial, onChange]);

  const updateNodeAction = useCallback((nodeId: string, action: FlowAction) => {
    onChange({
      ...initial,
      nodes: initial.nodes.map((n) =>
        n.id === nodeId && n.kind === "action" ? { ...n, action } : n
      ),
    });
  }, [initial, onChange]);

  const updateNodeCondition = useCallback((nodeId: string, condition: any) => {
    onChange({
      ...initial,
      nodes: initial.nodes.map((n) =>
        n.id === nodeId && n.kind === "condition" ? { ...n, condition } : n
      ),
    });
  }, [initial, onChange]);

  // ── Edge Operations ─────────────────────────────────────────────────────────

  const addEdge = useCallback((source: string, target: string, kind: "next" | "pass" | "fail") => {
    const filteredEdges = initial.edges.filter(
      (e) => !(e.source === source && e.kind === kind)
    );
    onChange({
      ...initial,
      edges: [...filteredEdges, { id: uid(), source, target, kind }],
    });
  }, [initial, onChange]);

  const removeEdge = useCallback((edgeId: string) => {
    onChange({
      ...initial,
      edges: initial.edges.filter((e) => e.id !== edgeId),
    });
  }, [initial, onChange]);

  // ── Connection Helpers ─────────────────────────────────────────────────────

  const startConnection = useCallback((nodeId: string, kind: "next" | "pass" | "fail") => {
    setConnectingFrom({ nodeId, kind });
  }, []);

  const handleConnectionMouseUp = useCallback((e: MouseEvent) => {
    if (!connectingFrom) return;
    const target = e.target as HTMLElement;
    const nodeEl = target.closest("[data-node-id]") as HTMLElement | null;
    if (nodeEl) {
      const targetNodeId = nodeEl.dataset.nodeId;
      if (targetNodeId && targetNodeId !== connectingFrom.nodeId) {
        addEdge(connectingFrom.nodeId, targetNodeId, connectingFrom.kind);
      }
    }
    setConnectingFrom(null);
    setConnectingMousePos(null);
  }, [connectingFrom, addEdge]);

  const completeConnection = useCallback((targetNodeId: string) => {
    if (connectingFrom && connectingFrom.nodeId !== targetNodeId) {
      addEdge(connectingFrom.nodeId, targetNodeId, connectingFrom.kind);
    }
    setConnectingFrom(null);
    setConnectingMousePos(null);
  }, [connectingFrom, addEdge]);

  const cancelConnection = useCallback(() => {
    setConnectingFrom(null);
    setConnectingMousePos(null);
  }, []);

  const preventDefault = useCallback((e: Event) => e.preventDefault(), []);

  useEffect(() => {
    if (connectingFrom || draggingNode) {
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
      document.body.style.cursor = connectingFrom ? "crosshair" : "grabbing";
      if (connectingFrom) {
        document.addEventListener("mouseup", handleConnectionMouseUp);
        document.addEventListener("dragstart", preventDefault as EventListener);
      }
    } else {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      document.body.style.cursor = "";
    }
    return () => {
      document.body.style.userSelect = "";
      document.body.style.webkitUserSelect = "";
      document.body.style.cursor = "";
      document.removeEventListener("mouseup", handleConnectionMouseUp);
      document.removeEventListener("dragstart", preventDefault as EventListener);
    };
  }, [connectingFrom, draggingNode, handleConnectionMouseUp, preventDefault]);

  // ── Render Helpers ──────────────────────────────────────────────────────────

  const getNodeOutputs = (node: NodeData) => {
    if (node.kind === "condition") {
      return [
        { kind: "pass" as const, label: "True", color: "#10b981", description: "Runs when condition is true" },
        { kind: "fail" as const, label: "False", color: "#ef4444", description: "Runs when condition is false" },
        { kind: "next" as const, label: "After", color: "#6b7280", description: "Runs after condition check" },
      ];
    }
    return [{ kind: "next" as const, label: "Next", color: "#6b7280", description: "Continues to next action" }];
  };

  const getConnectedEdge = (nodeId: string, kind: "next" | "pass" | "fail") => {
    return initial.edges.find((e) => e.source === nodeId && e.kind === kind);
  };

  const getNodeById = (nodeId: string) => {
    return nodesWithPositions.find((n) => n.id === nodeId);
  };

  // Get connection point position for a node output port
  const getConnectionPointPos = (node: NodeData, kind: "next" | "pass" | "fail"): { x: number; y: number } => {
    const outputs = getNodeOutputs(node);
    const index = outputs.findIndex((o) => o.kind === kind);
    const total = outputs.length;
    const nodeBodyHeight = node.kind === "condition" ? CONDITION_NODE_BODY_HEIGHT : ACTION_NODE_BODY_HEIGHT;
    const spacing = NODE_WIDTH / (total + 1);
    return {
      x: node.position.x + spacing * (index + 1),
      y: node.position.y + nodeBodyHeight,
    };
  };

  // Get the INPUT port position (top center of node body)
  const getInputPortPos = (node: NodeData): { x: number; y: number } => {
    return {
      x: node.position.x + NODE_WIDTH / 2,
      y: node.position.y + INPUT_PORT_Y_OFFSET,
    };
  };

  // ── Node Inspector ─────────────────────────────────────────────────────────

  const selectedNode = selectedNodeId ? getNodeById(selectedNodeId) : null;
  const editingNodeData = editingNode ? getNodeById(editingNode) : null;

  const actionLabel = (type: string) => {
    const labels: Record<string, string> = {
      do_nothing: "Do Nothing",
      check: "Check Condition",
      set_variable: "Set Variable",
      stop: "Stop Flow",
    };
    return labels[type] ?? type;
  };

  return (
    <div ref={containerRef} className="flex h-full bg-[#1e1f22] rounded-lg overflow-hidden border border-[#3f4147]">
      {/* Left Palette */}
      <div className="w-64 border-r border-[#3f4147] bg-[#2b2d31] flex flex-col">
        {/* Steps — draggable action types */}
        <div className="p-3 border-b border-[#3f4147]">
          <h3 className="text-sm font-semibold text-white">Steps</h3>
          <p className="text-xs text-[#b5bac1] mt-0.5">Drag to canvas</p>
        </div>
        <ScrollArea className="flex-1" data-scrollable="true">
          <div className="p-3 space-y-2">
            {ACTION_PALETTE.map(({ type, label, icon: Icon, color }) => (
              <div
                key={type}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("computationActionType", type);
                }}
                className="w-full flex items-center gap-2 p-2.5 rounded-lg bg-[#1e1f22] border border-[#3f4147] cursor-move hover:border-[#5865F2] hover:bg-[#2b2d31] transition-colors group"
              >
                <div
                  className="w-7 h-7 rounded flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <span className="text-xs text-white group-hover:text-[#5865F2]">{label}</span>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Elements — referenceable values */}
        <div className="border-t border-[#3f4147]">
          <div className="p-3 border-b border-[#3f4147]">
            <h3 className="text-sm font-semibold text-white">Elements</h3>
            <p className="text-xs text-[#b5bac1] mt-0.5">Use in set_variable</p>
          </div>
          <ScrollArea className="max-h-48" data-scrollable="true">
            <div className="p-3 space-y-1">
              <p className="text-[10px] text-[#b5bac1] uppercase tracking-wide mb-2">Server Stats</p>
              {stats.map((stat) => (
                <div
                  key={stat.element}
                  className="flex items-center justify-between px-2 py-1 rounded bg-[#1e1f22] border border-[#3f4147]"
                >
                  <span className="text-xs text-[#14b8a6] font-mono">{stat.element}</span>
                  <span className="text-[10px] text-[#6b7280] truncate ml-2">{stat.label}</span>
                </div>
              ))}
              {stats.length === 0 && (
                <>
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-[#1e1f22] border border-[#3f4147]">
                    <span className="text-xs text-[#14b8a6] font-mono">total_members</span>
                    <span className="text-[10px] text-[#6b7280]">Total Members</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-[#1e1f22] border border-[#3f4147]">
                    <span className="text-xs text-[#14b8a6] font-mono">active_members</span>
                    <span className="text-[10px] text-[#6b7280]">Active Members</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-[#1e1f22] border border-[#3f4147]">
                    <span className="text-xs text-[#14b8a6] font-mono">online_count</span>
                    <span className="text-[10px] text-[#6b7280]">Online Count</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-[#1e1f22] border border-[#3f4147]">
                    <span className="text-xs text-[#14b8a6] font-mono">total_messages</span>
                    <span className="text-[10px] text-[#6b7280]">Total Messages</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-[#1e1f22] border border-[#3f4147]">
                    <span className="text-xs text-[#14b8a6] font-mono">total_events</span>
                    <span className="text-[10px] text-[#6b7280]">Total Events</span>
                  </div>
                  <div className="flex items-center justify-between px-2 py-1 rounded bg-[#1e1f22] border border-[#3f4147]">
                    <span className="text-xs text-[#14b8a6] font-mono">voice_minutes</span>
                    <span className="text-[10px] text-[#6b7280]">Voice Minutes</span>
                  </div>
                </>
              )}
              <p className="text-[10px] text-[#b5bac1] uppercase tracking-wide mb-2 mt-3">Custom</p>
              <p className="text-[10px] text-[#6b7280] px-1">
                Any element key you define in your template can be used here.
              </p>
            </div>
          </ScrollArea>
        </div>

        <div className="p-3 border-t border-[#3f4147]">
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 text-xs text-[#b5bac1] hover:text-white transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            How to connect nodes
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Toolbar */}
        <div className="h-12 border-b border-[#3f4147] bg-[#2b2d31] flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom((z) => Math.min(z * 1.2, 3))}
              className="text-[#b5bac1] hover:text-white h-8 w-8"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <span className="text-xs text-[#b5bac1] min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom((z) => Math.max(z * 0.8, 0.25))}
              className="text-[#b5bac1] hover:text-white h-8 w-8"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="text-[#b5bac1] hover:text-white h-8 w-8"
              title="Reset view"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {connectingFrom && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#5865F2]/20 border border-[#5865F2] rounded-md">
              <span className="text-xs text-[#5865F2]">
                Click on a target node to connect, or press Esc to cancel
              </span>
              <button onClick={cancelConnection} className="text-[#5865F2] hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-[#b5bac1]">
            <span className="mr-2 text-[10px] uppercase tracking-wide opacity-60">Legend:</span>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span>True</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <span>False</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#6b7280]" />
              <span>Next</span>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDrop={(e) => {
            e.preventDefault();
            const type = e.dataTransfer.getData("computationActionType") as ComputationActionType;
            if (!type || !canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left - pan.x) / zoom;
            const y = (e.clientY - rect.top - pan.y) / zoom;
            addNode(type, { x, y });
          }}
          onDragOver={(e) => e.preventDefault()}
          data-canvas="true"
        >
          {/* Grid */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, #3f4147 1px, transparent 1px), linear-gradient(to bottom, #3f4147 1px, transparent 1px)`,
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`,
              opacity: 0.2,
            }}
          />

          {/* Transform Container */}
          <div
            className="absolute origin-top-left"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            {/* Edges SVG */}
            <svg
              className="absolute pointer-events-none"
              style={{ width: "5000px", height: "5000px", left: 0, top: 0 }}
            >
              <defs>
                <marker id="c-arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                </marker>
                <marker id="c-arrowhead-pass" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                </marker>
                <marker id="c-arrowhead-fail" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                </marker>
              </defs>

              {initial.edges.map((edge) => {
                const sourceNode = getNodeById(edge.source);
                const targetNode = getNodeById(edge.target);
                if (!sourceNode || !targetNode) return null;
                const startPos = getConnectionPointPos(sourceNode, edge.kind);
                const endPos = getInputPortPos(targetNode);
                const color = getEdgeColor(edge.kind);
                const markerId = edge.kind === "pass" ? "url(#c-arrowhead-pass)" : edge.kind === "fail" ? "url(#c-arrowhead-fail)" : "url(#c-arrowhead)";
                // Horizontal bezier: exit right, curve down/up, enter top
                const path = `M ${startPos.x} ${startPos.y} C ${startPos.x} ${startPos.y + 40}, ${endPos.x} ${endPos.y - 40}, ${endPos.x} ${endPos.y}`;
                return (
                  <g key={edge.id}>
                    <path
                      d={path}
                      stroke={color}
                      strokeWidth="2"
                      fill="none"
                      markerEnd={markerId}
                      className="pointer-events-auto cursor-pointer"
                      onClick={() => removeEdge(edge.id)}
                    />
                    <text
                      x={(startPos.x + endPos.x) / 2}
                      y={(startPos.y + endPos.y) / 2 - 5}
                      fill={color}
                      fontSize="10"
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {getEdgeLabel(edge.kind)}
                    </text>
                  </g>
                );
              })}

              {connectingFrom && connectingMousePos && (
                <line
                  x1={getConnectionPointPos(getNodeById(connectingFrom.nodeId)!, connectingFrom.kind).x}
                  y1={getConnectionPointPos(getNodeById(connectingFrom.nodeId)!, connectingFrom.kind).y}
                  x2={connectingMousePos.x}
                  y2={connectingMousePos.y}
                  stroke={getEdgeColor(connectingFrom.kind)}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  markerEnd="url(#c-arrowhead)"
                />
              )}
            </svg>

            {/* Nodes */}
            {nodesWithPositions.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isEntry = initial.entry_node_id === node.id;
              const actionType = node.kind === "action" ? node.action?.type : "check";
              const paletteItem = ACTION_PALETTE.find((a) => a.type === actionType);
              const Icon = paletteItem?.icon || Check;
              const color = paletteItem?.color || "#6b7280";
              const outputs = getNodeOutputs(node);
              const isConnectionTarget = !!connectingFrom && connectingFrom.nodeId !== node.id;
              const nodeWidth = 280;

              return (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  className={cn(
                    "absolute rounded-lg border-2 transition-all select-none",
                    isSelected ? "border-[#5865F2] shadow-lg shadow-[#5865F2]/20" : "border-[#3f4147] hover:border-[#5865F2]/50",
                    isEntry && "ring-2 ring-[#f59e0b] ring-offset-2 ring-offset-[#1e1f22]",
                    isConnectionTarget && "ring-2 ring-[#5865F2] cursor-pointer"
                  )}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    width: `${nodeWidth}px`,
                    backgroundColor: "#2b2d31",
                    zIndex: isSelected ? 10 : 1,
                  }}
                  onMouseDown={(e) => {
                    if (isConnectionTarget) {
                      e.stopPropagation();
                      completeConnection(node.id);
                    } else if (!connectingFrom) {
                      e.stopPropagation();
                      dragOffsetRef.current = {
                        x: (e.clientX - (canvasRef.current?.getBoundingClientRect().left || 0) - pan.x) / zoom - node.position.x,
                        y: (e.clientY - (canvasRef.current?.getBoundingClientRect().top || 0) - pan.y) / zoom - node.position.y,
                      };
                      dragNodePosRef.current = { ...node.position };
                      setDraggingNode(node.id);
                      setSelectedNodeId(node.id);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isConnectionTarget) completeConnection(node.id);
                    else setSelectedNodeId(node.id);
                  }}
                  onDoubleClick={() => setEditingNode(node.id)}
                >
                  {/* Node Header */}
                  <div className="flex items-center gap-2 p-3 border-b border-[#3f4147] cursor-move">
                    <div className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
                      <Icon className="w-3.5 h-3.5" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {actionLabel(actionType ?? "")}
                      </p>
                      {isEntry && (
                        <p className="text-[10px] text-[#f59e0b]">Entry point</p>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}
                      className="text-[#6b7280] hover:text-[#ef4444] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Node Preview */}
                  <div className="p-3">
                    {node.kind === "action" && node.action?.type === "set_variable" && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#6b7280]">var</span>
                          <span className="text-xs text-[#14b8a6] font-mono">
                            {node.action.varName || "?"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#6b7280]">=</span>
                          <span className="text-xs text-[#dbdee1] font-mono truncate">
                            {node.action.value || "..."}
                          </span>
                        </div>
                      </div>
                    )}
                    {node.kind === "action" && node.action?.type === "check" && (
                      <p className="text-xs text-[#8b5cf6]">
                        {node.action.condition?.operator ?? "condition"}...
                      </p>
                    )}
                    {node.kind === "action" && (node.action?.type === "do_nothing" || node.action?.type === "stop") && (
                      <p className="text-xs text-[#6b7280]">
                        {node.action.type === "stop" ? "Stops computation" : "No operation"}
                      </p>
                    )}
                    {node.kind === "condition" && (
                      <p className="text-xs text-[#8b5cf6]">
                        {node.condition?.operator ?? "condition"}...
                      </p>
                    )}
                  </div>

                  {/* Connection Ports */}
                  <div className="flex justify-around pb-2 pt-1 border-t border-[#3f4147]">
                    {outputs.map((output) => {
                      const existingEdge = getConnectedEdge(node.id, output.kind);
                      const isConnecting = connectingFrom?.nodeId === node.id && connectingFrom?.kind === output.kind;
                      return (
                        <div
                          key={output.kind}
                          className="flex flex-col items-center gap-0.5 group relative select-none"
                          data-connection-point="true"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isConnecting) {
                              cancelConnection();
                            } else {
                              startConnection(node.id, output.kind);
                            }
                          }}
                          title={output.description}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border-2 transition-all cursor-crosshair select-none",
                              existingEdge
                                ? "bg-current border-current"
                                : "bg-[#1e1f22] border-current group-hover:scale-125 group-hover:shadow-lg",
                              isConnecting && "animate-pulse scale-125"
                            )}
                            style={{ color: output.color }}
                          />
                          <span className="text-[10px] text-[#b5bac1] font-medium select-none pointer-events-none">{output.label}</span>
                          {existingEdge && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#5865F2] rounded-full pointer-events-none" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Inspector Panel */}
      {selectedNode && (
        <div className="w-72 border-l border-[#3f4147] bg-[#2b2d31] flex flex-col overflow-hidden">
          <div className="p-3 border-b border-[#3f4147] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Edit Node</h3>
            <button onClick={() => setSelectedNodeId(null)} className="text-[#6b7280] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <ScrollArea className="flex-1" data-scrollable="true">
            <div className="p-3 space-y-3">
              {selectedNode.kind === "action" && selectedNode.action?.type === "set_variable" && (
                <>
                  <div>
                    <label className="text-xs text-[#b5bac1] block mb-1">Variable Name</label>
                    <input
                      type="text"
                      value={selectedNode.action.varName ?? ""}
                      onChange={(e) => {
                        updateNodeAction(selectedNode.id, {
                          ...(selectedNode.action as FaSetVariable),
                          varName: e.target.value,
                        });
                      }}
                      placeholder="my_variable"
                      className="w-full bg-[#1e1f22] text-[#dbdee1] border border-[#3f4147] rounded px-2 py-1.5 text-xs outline-none focus:border-[#5865F2]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#b5bac1] block mb-1">Expression</label>
                    <textarea
                      value={selectedNode.action.value ?? ""}
                      onChange={(e) => {
                        updateNodeAction(selectedNode.id, {
                          ...(selectedNode.action as FaSetVariable),
                          value: e.target.value,
                        });
                      }}
                      placeholder="active_members / total_members * 100"
                      rows={3}
                      className="w-full bg-[#1e1f22] text-[#dbdee1] border border-[#3f4147] rounded px-2 py-1.5 text-xs outline-none focus:border-[#5865F2] font-mono resize-none"
                    />
                    <p className="text-[10px] text-[#6b7280] mt-1">
                      Available: total_members, active_members, total_messages, total_events, voice_minutes, variables
                    </p>
                  </div>
                </>
              )}
              {selectedNode.kind === "action" && selectedNode.action?.type === "check" && (
                <div>
                  <label className="text-xs text-[#b5bac1] block mb-2">Condition</label>
                  <ConditionBuilder
                    condition={selectedNode.action.condition ?? createDefaultCondition()}
                    onChange={(cond) => {
                      updateNodeAction(selectedNode.id, {
                        ...(selectedNode.action as FaCheck),
                        condition: cond,
                      });
                    }}
                  />
                </div>
              )}
              {selectedNode.kind === "condition" && (
                <div>
                  <label className="text-xs text-[#b5bac1] block mb-2">Condition</label>
                  <ConditionBuilder
                    condition={selectedNode.condition ?? createDefaultCondition()}
                    onChange={(cond) => {
                      updateNodeCondition(selectedNode.id, cond);
                    }}
                  />
                </div>
              )}
              <div className="pt-2">
                <label className="text-xs text-[#b5bac1] block mb-1">Set as Entry Point</label>
                <Button
                  variant={initial.entry_node_id === selectedNode.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    onChange({ ...initial, entry_node_id: selectedNode.id });
                  }}
                  className="w-full text-xs h-8"
                >
                  {initial.entry_node_id === selectedNode.id ? "Is Entry Point" : "Set as Entry Point"}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>How to Build a Computation Graph</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm text-[#dbdee1]">
            <p><strong className="text-white">Add nodes:</strong> Drag actions from the left palette onto the canvas.</p>
            <p><strong className="text-white">Connect nodes:</strong> Click and drag from a node&apos;s colored dot to another node&apos;s body.</p>
            <p><strong className="text-white">Delete edges:</strong> Click on any edge line.</p>
            <p><strong className="text-white">Edit nodes:</strong> Double-click a node to open its inspector on the right.</p>
            <p><strong className="text-white">Variables:</strong> Use <code className="text-[#14b8a6]">set_variable</code> to create variables that other stats can reference via <strong className="text-white">Bindings</strong>.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
