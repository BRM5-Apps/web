"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ZoomIn,
  ZoomOut,
  Move,
  MousePointer2,
  Trash2,
  Settings,
  Play,
  Check,
  X,
  Clock,
  Shield,
  MessageSquare,
  Plus,
  Minus,
  RotateCcw,
  Save,
  GitBranch,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import type {
  ActionGraphDocument,
  ActionGraphNode,
  ActionGraphEdge,
  FlowActionType,
  FlowAction,
} from "./types";
import { makeAction, actionLabel } from "./flow-editor";
import { ActionFields } from "./action-fields";
import { ConditionBuilder, createCondition } from "./condition-builder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Types ───────────────────────────────────────────────────────────────────

interface Position {
  x: number;
  y: number;
}

type NodeData = ActionGraphNode & {
  position: Position;
};

interface VisualActionEditorProps {
  graph: ActionGraphDocument;
  onChange: (graph: ActionGraphDocument) => void;
  serverId?: string;
}

// ── Action Palette Items ─────────────────────────────────────────────────────

const ACTION_PALETTE = [
  { type: "do_nothing", label: "Do Nothing", icon: MousePointer2, color: "#6b7280" },
  { type: "wait", label: "Wait", icon: Clock, color: "#f59e0b" },
  { type: "check", label: "Check Condition", icon: Check, color: "#8b5cf6" },
  { type: "add_role", label: "Add Role", icon: Shield, color: "#10b981" },
  { type: "remove_role", label: "Remove Role", icon: Shield, color: "#ef4444" },
  { type: "toggle_role", label: "Toggle Role", icon: Shield, color: "#3b82f6" },
  { type: "send_output", label: "Send Output", icon: MessageSquare, color: "#5865F2" },
  { type: "create_thread", label: "Create Thread", icon: Plus, color: "#ec4899" },
  { type: "set_variable", label: "Set Variable", icon: Settings, color: "#14b8a6" },
  { type: "delete_message", label: "Delete Message", icon: Trash2, color: "#dc2626" },
  { type: "stop", label: "Stop Flow", icon: X, color: "#991b1b" },
] as const;

// ── Helper Functions ─────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID();
}

function getEdgeColor(kind: "next" | "pass" | "fail"): string {
  switch (kind) {
    case "pass":
      return "#10b981"; // Green
    case "fail":
      return "#ef4444"; // Red
    case "next":
    default:
      return "#6b7280"; // Grey
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

// ── Main Component ────────────────────────────────────────────────────────────

export function VisualActionEditor({
  graph,
  onChange,
  serverId,
}: VisualActionEditorProps) {
  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });

  // Node dragging state
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  // Connection state - improved with drag-to-connect
  const [connectingFrom, setConnectingFrom] = useState<{
    nodeId: string;
    kind: "next" | "pass" | "fail";
  } | null>(null);
  const [connectingMousePos, setConnectingMousePos] = useState<Position | null>(null);
  const [draggingToConnect, setDraggingToConnect] = useState(false);

  // Selection
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure all nodes have positions
  const nodesWithPositions = useMemo(() => {
    return graph.nodes.map((node, index) => ({
      ...node,
      position: node.position || {
        x: 100 + (index % 3) * 300,
        y: 100 + Math.floor(index / 3) * 150,
      },
    }));
  }, [graph.nodes]);

  // ── Canvas Interactions ────────────────────────────────────────────────────

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Don't zoom if scrolling inside a scrollable element (like ScrollArea)
    const target = e.target as HTMLElement;

    // Check if we're inside a scrollable container
    let el: HTMLElement | null = target;
    while (el) {
      const style = window.getComputedStyle(el);
      const isScrollable = style.overflow === 'auto' || style.overflow === 'scroll' ||
        style.overflowY === 'auto' || style.overflowY === 'scroll' ||
        style.overflowX === 'auto' || style.overflowX === 'scroll';
      const hasScrollableData = el.dataset.scrollable === 'true' ||
        el.getAttribute('data-radix-scroll-area-viewport') !== null;

      if (isScrollable || hasScrollableData) {
        // Let the scrollable element handle the scroll naturally
        return;
      }
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
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }

    // Update connecting line position
    if (connectingFrom && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setConnectingMousePos({
        x: (e.clientX - rect.left - pan.x) / zoom,
        y: (e.clientY - rect.top - pan.y) / zoom,
      });
    }

    if (draggingNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom - dragOffset.x;
      const y = (e.clientY - rect.top - pan.y) / zoom - dragOffset.y;

      updateNodePosition(draggingNode, { x, y });
    }
  }, [isPanning, pan, draggingNode, zoom, dragOffset, panStart, connectingFrom]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNode(null);
    setDraggingToConnect(false);
  }, []);

  // ── Node Operations ────────────────────────────────────────────────────────

  const updateNodePosition = useCallback((nodeId: string, position: Position) => {
    onChange({
      ...graph,
      nodes: graph.nodes.map((n) =>
        n.id === nodeId ? { ...n, position } : n
      ),
    });
  }, [graph, onChange]);

  const addNode = useCallback((type: FlowActionType, position: Position) => {
    const newNode: ActionGraphNode =
      type === "check"
        ? { id: uid(), kind: "condition", position }
        : { id: uid(), kind: "action", action: makeAction(type), position };

    onChange({
      ...graph,
      nodes: [...graph.nodes, newNode],
      entry_node_id: graph.entry_node_id || newNode.id,
    });
  }, [graph, onChange]);

  const removeNode = useCallback((nodeId: string) => {
    onChange({
      ...graph,
      nodes: graph.nodes.filter((n) => n.id !== nodeId),
      edges: graph.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      entry_node_id: graph.entry_node_id === nodeId ? undefined : graph.entry_node_id,
    });
    setSelectedNodeId(null);
  }, [graph, onChange]);

  const updateNodeAction = useCallback((nodeId: string, action: FlowAction) => {
    onChange({
      ...graph,
      nodes: graph.nodes.map((n) =>
        n.id === nodeId && n.kind === "action" ? { ...n, action } : n
      ),
    });
  }, [graph, onChange]);

  const updateNodeCondition = useCallback((nodeId: string, condition: import("./types").ConditionNode) => {
    onChange({
      ...graph,
      nodes: graph.nodes.map((n) =>
        n.id === nodeId && n.kind === "condition" ? { ...n, condition } : n
      ),
    });
  }, [graph, onChange]);

  // ── Edge Operations ─────────────────────────────────────────────────────────

  const addEdge = useCallback((source: string, target: string, kind: "next" | "pass" | "fail") => {
    // Remove existing edge of same kind from source
    const filteredEdges = graph.edges.filter(
      (e) => !(e.source === source && e.kind === kind)
    );

    onChange({
      ...graph,
      edges: [...filteredEdges, { id: uid(), source, target, kind }],
    });
  }, [graph, onChange]);

  const removeEdge = useCallback((edgeId: string) => {
    onChange({
      ...graph,
      edges: graph.edges.filter((e) => e.id !== edgeId),
    });
  }, [graph, onChange]);

  // ── Drag and Drop from Palette ──────────────────────────────────────────────

  const handlePaletteDragStart = useCallback((e: React.DragEvent, type: FlowActionType) => {
    e.dataTransfer.setData("actionType", type);
  }, []);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("actionType") as FlowActionType;
    if (!type || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    addNode(type, { x, y });
  }, [addNode, pan, zoom]);

  // ── Connection Helpers ─────────────────────────────────────────────────────

  const startConnection = useCallback((nodeId: string, kind: "next" | "pass" | "fail") => {
    setConnectingFrom({ nodeId, kind });
    setDraggingToConnect(true);
  }, []);

  // Handle connection completion on mouse up anywhere
  const handleConnectionMouseUp = useCallback((e: MouseEvent) => {
    if (!connectingFrom) return;

    // Find if we dropped on a node
    const target = e.target as HTMLElement;
    const nodeEl = target.closest('[data-node-id]') as HTMLElement | null;

    if (nodeEl) {
      const targetNodeId = nodeEl.dataset.nodeId;
      if (targetNodeId && targetNodeId !== connectingFrom.nodeId) {
        addEdge(connectingFrom.nodeId, targetNodeId, connectingFrom.kind);
      }
    }

    setConnectingFrom(null);
    setConnectingMousePos(null);
    setDraggingToConnect(false);
  }, [connectingFrom, addEdge]);

  const completeConnection = useCallback((targetNodeId: string) => {
    if (connectingFrom && connectingFrom.nodeId !== targetNodeId) {
      addEdge(connectingFrom.nodeId, targetNodeId, connectingFrom.kind);
    }
    setConnectingFrom(null);
    setConnectingMousePos(null);
    setDraggingToConnect(false);
  }, [connectingFrom, addEdge]);

  const cancelConnection = useCallback(() => {
    setConnectingFrom(null);
    setConnectingMousePos(null);
    setDraggingToConnect(false);
  }, []);

  const preventDefault = useCallback((e: Event) => e.preventDefault(), []);

  // Prevent text selection during drag and handle connection drop
  useEffect(() => {
    if (connectingFrom || draggingNode) {
      document.body.style.userSelect = "none";
      document.body.style.webkitUserSelect = "none";
      document.body.style.cursor = connectingFrom ? "crosshair" : "grabbing";

      // Add global mouseup listener for connection drop
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
    return graph.edges.find((e) => e.source === nodeId && e.kind === kind);
  };

  const getNodeById = (nodeId: string) => {
    return nodesWithPositions.find((n) => n.id === nodeId);
  };

  // Get connection point position for a node
  const getConnectionPointPos = (node: NodeData, kind: "next" | "pass" | "fail") => {
    const outputs = getNodeOutputs(node);
    const index = outputs.findIndex((o) => o.kind === kind);
    const total = outputs.length;
    const nodeWidth = 280;
    const spacing = nodeWidth / (total + 1);
    return {
      x: node.position.x + spacing * (index + 1),
      y: node.position.y + 140, // Approximate bottom of node
    };
  };

  return (
    <div ref={containerRef} className="flex h-full bg-[#1e1f22]">
      {/* Left Palette */}
      <div className="w-64 border-r border-[#3f4147] bg-[#2b2d31] flex flex-col">
        <div className="p-4 border-b border-[#3f4147]">
          <h3 className="text-sm font-semibold text-white">Actions</h3>
          <p className="text-xs text-[#b5bac1] mt-1">Drag to canvas</p>
        </div>
        <ScrollArea className="flex-1" data-scrollable="true">
          <div className="p-3 space-y-2">
            {ACTION_PALETTE.map(({ type, label, icon: Icon, color }) => (
              <div
                key={type}
                draggable
                onDragStart={(e) => handlePaletteDragStart(e, type as FlowActionType)}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#1e1f22] border border-[#3f4147] cursor-move hover:border-[#5865F2] hover:bg-[#2b2d31] transition-colors group"
              >
                <div
                  className="w-8 h-8 rounded flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-sm text-white group-hover:text-[#5865F2]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-[#3f4147]">
          <button
            onClick={() => setShowHelp(true)}
            className="flex items-center gap-2 text-xs text-[#b5bac1] hover:text-white transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            How to connect nodes
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Toolbar */}
        <div className="h-14 border-b border-[#3f4147] bg-[#2b2d31] flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoom((z) => Math.min(z * 1.2, 3))}
              className="text-[#b5bac1] hover:text-white"
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
              className="text-[#b5bac1] hover:text-white"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="text-[#b5bac1] hover:text-white"
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
              <button
                onClick={cancelConnection}
                className="text-[#5865F2] hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-[#b5bac1]">
              <div className="w-3 h-3 rounded-full bg-[#10b981]" />
              <span>True</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#b5bac1]">
              <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
              <span>False</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#b5bac1]">
              <div className="w-3 h-3 rounded-full bg-[#6b7280]" />
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
          onDrop={handleCanvasDrop}
          onDragOver={(e) => e.preventDefault()}
          data-canvas="true"
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #3f4147 1px, transparent 1px),
                linear-gradient(to bottom, #3f4147 1px, transparent 1px)
              `,
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`,
              opacity: 0.2,
            }}
          />

          {/* Transform Container */}
          <div
            className="absolute origin-top-left"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            }}
          >
            {/* Connection Lines SVG */}
            <svg
              className="absolute pointer-events-none"
              style={{
                width: "5000px",
                height: "5000px",
                left: 0,
                top: 0,
              }}
            >
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
                </marker>
                <marker id="arrowhead-pass" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                </marker>
                <marker id="arrowhead-fail" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#ef4444" />
                </marker>
              </defs>

              {/* Existing edges */}
              {graph.edges.map((edge) => {
                const sourceNode = getNodeById(edge.source);
                const targetNode = getNodeById(edge.target);
                if (!sourceNode || !targetNode) return null;

                const startPos = getConnectionPointPos(sourceNode, edge.kind);
                const endPos = {
                  x: targetNode.position.x + 140, // Center of node
                  y: targetNode.position.y,
                };

                const color = getEdgeColor(edge.kind);
                const markerId = edge.kind === "pass" ? "url(#arrowhead-pass)" : edge.kind === "fail" ? "url(#arrowhead-fail)" : "url(#arrowhead)";

                // Calculate control points for bezier curve
                const midY = (startPos.y + endPos.y) / 2;
                const path = `M ${startPos.x} ${startPos.y} C ${startPos.x} ${midY}, ${endPos.x} ${midY}, ${endPos.x} ${endPos.y}`;

                return (
                  <g key={edge.id}>
                    <path
                      d={path}
                      stroke={color}
                      strokeWidth="2"
                      fill="none"
                      markerEnd={markerId}
                      className="pointer-events-auto cursor-pointer hover:stroke-width-3"
                      onClick={() => removeEdge(edge.id)}
                    />
                    {/* Edge label */}
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

              {/* Connecting line while dragging */}
              {connectingFrom && connectingMousePos && (
                <g>
                  <line
                    x1={getConnectionPointPos(getNodeById(connectingFrom.nodeId)!, connectingFrom.kind).x}
                    y1={getConnectionPointPos(getNodeById(connectingFrom.nodeId)!, connectingFrom.kind).y}
                    x2={connectingMousePos.x}
                    y2={connectingMousePos.y}
                    stroke={getEdgeColor(connectingFrom.kind)}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    markerEnd="url(#arrowhead)"
                  />
                </g>
              )}
            </svg>

            {/* Nodes */}
            {nodesWithPositions.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isEntry = graph.entry_node_id === node.id;
              const actionType = node.kind === "action" ? node.action.type : "check";
              const paletteItem = ACTION_PALETTE.find((a) => a.type === actionType);
              const Icon = paletteItem?.icon || Play;
              const color = paletteItem?.color || "#6b7280";
              const outputs = getNodeOutputs(node);
              const isConnectionTarget = connectingFrom && connectingFrom.nodeId !== node.id;

              const nodeWidth = 280;

              return (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  className={cn(
                    "absolute rounded-lg border-2 transition-all select-none",
                    isSelected
                      ? "border-[#5865F2] shadow-lg shadow-[#5865F2]/20"
                      : "border-[#3f4147] hover:border-[#5865F2]/50",
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
                      setDraggingNode(node.id);
                      setDragOffset({
                        x: (e.clientX - (canvasRef.current?.getBoundingClientRect().left || 0) - pan.x) / zoom - node.position.x,
                        y: (e.clientY - (canvasRef.current?.getBoundingClientRect().top || 0) - pan.y) / zoom - node.position.y,
                      });
                      setSelectedNodeId(node.id);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isConnectionTarget) {
                      completeConnection(node.id);
                    } else {
                      setSelectedNodeId(node.id);
                    }
                  }}
                  onDoubleClick={() => setEditingNode(node.id)}
                >
                  {/* Node Header */}
                  <div
                    className="flex items-center gap-2 p-3 border-b border-[#3f4147] cursor-move"
                    style={{ borderLeft: `4px solid ${color}` }}
                  >
                    <Icon className="w-4 h-4" style={{ color }} />
                    <span className="text-sm font-medium text-white flex-1">
                      {node.kind === "action" ? actionLabel(node.action) : "Check Condition"}
                    </span>
                    {isEntry && (
                      <span className="text-[10px] bg-[#f59e0b] text-black px-1.5 py-0.5 rounded font-semibold">
                        START
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNode(node.id);
                      }}
                      className="text-[#b5bac1] hover:text-red-400 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Node Body */}
                  <div className="p-3">
                    {node.kind === "action" && (
                      <div className="text-xs text-[#b5bac1] truncate">
                        {getActionSummary(node.action)}
                      </div>
                    )}
                    {node.kind === "condition" && (
                      <div className="text-xs text-[#b5bac1]">
                        {node.condition ? getConditionSummary(node.condition) : "No condition configured"}
                      </div>
                    )}
                  </div>

                  {/* Connection Points */}
                  <div className="flex justify-around pb-2">
                    {outputs.map(({ kind, label, color: outputColor, description }) => {
                      const existingEdge = getConnectedEdge(node.id, kind);
                      const isConnecting = connectingFrom?.nodeId === node.id && connectingFrom?.kind === kind;
                      return (
                        <div
                          key={kind}
                          className="flex flex-col items-center gap-1 group relative select-none"
                          data-connection-point="true"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (isConnecting) {
                              cancelConnection();
                            } else {
                              startConnection(node.id, kind);
                            }
                          }}
                          title={description}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border-2 transition-all cursor-crosshair select-none",
                              existingEdge
                                ? "bg-current border-current"
                                : "bg-[#1e1f22] border-current group-hover:scale-125 group-hover:shadow-lg",
                              isConnecting && "animate-pulse scale-125"
                            )}
                            style={{ color: outputColor }}
                          />
                          {label && (
                            <span className="text-[10px] text-[#b5bac1] font-medium select-none pointer-events-none">{label}</span>
                          )}
                          {/* Connection status indicator */}
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

      {/* Properties Panel */}
      {selectedNodeId && (
        <div className="w-80 border-l border-[#3f4147] bg-[#2b2d31] flex flex-col">
          <div className="p-4 border-b border-[#3f4147]">
            <h3 className="text-sm font-semibold text-white">Properties</h3>
          </div>
          <ScrollArea className="flex-1 p-4" data-scrollable="true">
            {(() => {
              const node = graph.nodes.find((n) => n.id === selectedNodeId);
              if (!node) return null;

              return (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-[#b5bac1]">Node ID</Label>
                    <div className="text-sm text-white font-mono mt-1">{node.id.slice(0, 8)}...</div>
                  </div>

                  {node.kind === "action" && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-[#b5bac1]">Action Type</Label>
                        <div className="text-sm text-white mt-1">{node.action.type}</div>
                      </div>

                      <div className="border-t border-[#3f4147] pt-3">
                        <ActionFields
                          action={node.action}
                          onChange={(updated) => updateNodeAction(node.id, updated)}
                          serverId={serverId}
                        />
                      </div>
                    </div>
                  )}

                  {node.kind === "condition" && (
                    <div className="space-y-4">
                      <div className="border-t border-[#3f4147] pt-3">
                        <Label className="text-xs text-[#b5bac1] mb-2 block">Condition</Label>
                        <div className="bg-[#1e1f22] rounded border border-[#3f4147] p-3">
                          <ConditionBuilder
                            condition={node.condition ?? createCondition("equal")}
                            onChange={(updated) => updated && updateNodeCondition(node.id, updated)}
                          />
                        </div>
                      </div>

                      {node.condition && node.condition.operator !== "and" && node.condition.operator !== "or" && (
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const current = node.condition!;
                              const wrapped: import("./types").AndCondition = {
                                id: uid(),
                                operator: "and",
                                conditions: [current],
                              };
                              updateNodeCondition(node.id, wrapped);
                            }}
                            className="text-xs h-7 border-[#5865F2]/50 text-[#5865F2] hover:bg-[#5865F2]/20"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Wrap in AND
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const current = node.condition!;
                              const wrapped: import("./types").OrCondition = {
                                id: uid(),
                                operator: "or",
                                conditions: [current],
                              };
                              updateNodeCondition(node.id, wrapped);
                            }}
                            className="text-xs h-7 border-[#f59e0b]/50 text-[#f59e0b] hover:bg-[#f59e0b]/20"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Wrap in OR
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="border-t border-[#3f4147] pt-3">
                    <Label className="text-xs text-[#b5bac1] mb-2 block">Outgoing Connections</Label>
                    {(() => {
                      const outgoingEdges = graph.edges.filter((e) => e.source === node.id);
                      if (outgoingEdges.length === 0) {
                        return (
                          <div className="text-xs text-[#b5bac1] italic">
                            No connections yet. Click and drag from the colored dots below the node to connect.
                          </div>
                        );
                      }
                      return outgoingEdges.map((edge) => {
                        const target = graph.nodes.find((n) => n.id === edge.target);
                        const targetLabel = target?.kind === "action" ? target.action.type : "condition";
                        const color = getEdgeColor(edge.kind);
                        return (
                          <div key={edge.id} className="flex items-center justify-between text-xs mb-2 p-2 bg-[#1e1f22] rounded">
                            <div className="flex items-center gap-2">
                              <span style={{ color }} className="font-medium">
                                {edge.kind === "pass" ? "If True" : edge.kind === "fail" ? "If False" : "Then"}
                              </span>
                              <ArrowRight className="w-3 h-3 text-[#b5bac1]" />
                              <span className="text-white">{targetLabel}</span>
                            </div>
                            <button
                              onClick={() => removeEdge(edge.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {node.kind === "condition" && (
                    <div className="border-t border-[#3f4147] pt-3">
                      <Label className="text-xs text-[#b5bac1] mb-2 block">How If/Else Works</Label>
                      <div className="space-y-2 text-xs text-[#b5bac1]">
                        <div className="flex items-start gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#10b981] mt-0.5 shrink-0" />
                          <span><strong className="text-white">True (Green):</strong> Flow continues here when the condition matches</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#ef4444] mt-0.5 shrink-0" />
                          <span><strong className="text-white">False (Red):</strong> Flow continues here when the condition doesn't match</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-3 h-3 rounded-full bg-[#6b7280] mt-0.5 shrink-0" />
                          <span><strong className="text-white">After (Grey):</strong> Flow always continues here after the check</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </ScrollArea>
        </div>
      )}

      {/* Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="bg-[#2b2d31] border-[#3f4147] text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">How to Connect Nodes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-[#b5bac1]">
            <div className="space-y-2">
              <h4 className="text-white font-medium flex items-center gap-2">
                <MousePointer2 className="w-4 h-4" />
                Method 1: Click to Connect
              </h4>
              <p>1. Click on a colored connection dot below a node</p>
              <p>2. Click on another node to create a connection</p>
              <p>3. Press Esc or click the same dot to cancel</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Move className="w-4 h-4" />
                Method 2: Drag to Connect
              </h4>
              <p>1. Click and drag from a connection dot</p>
              <p>2. Drop on another node to create a connection</p>
            </div>
            <div className="border-t border-[#3f4147] pt-3 mt-3">
              <h4 className="text-white font-medium mb-2">Connection Types</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                  <span><strong>True (Green):</strong> For condition nodes - when the check passes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <span><strong>False (Red):</strong> For condition nodes - when the check fails</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#6b7280]" />
                  <span><strong>Next (Grey):</strong> Continue to the next action</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Node Dialog */}
      <Dialog open={!!editingNode} onOpenChange={() => setEditingNode(null)}>
        <DialogContent className="bg-[#2b2d31] border-[#3f4147] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Node</DialogTitle>
          </DialogHeader>
          {(() => {
            const node = graph.nodes.find((n) => n.id === editingNode);
            if (!node) return null;
            return (
              <div className="space-y-4">
                {node.kind === "action" && (
                  <ActionFields
                    action={node.action}
                    onChange={(updated) => {
                      updateNodeAction(node.id, updated);
                      setEditingNode(null);
                    }}
                    serverId={serverId}
                  />
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Helper Components ───────────────────────────────────────────────────────

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={cn("text-xs font-medium", className)}>{children}</label>;
}

function getActionSummary(action: FlowAction): string {
  switch (action.type) {
    case "wait":
      return `Wait ${action.duration}${action.unit === "seconds" ? "s" : action.unit === "minutes" ? "m" : "h"}`;
    case "add_role":
    case "remove_role":
    case "toggle_role":
      return action.roleIds?.[0] || "No role selected";
    case "send_output":
      return action.outputKind === "modal" ? "Send modal" : "Send message";
    case "create_thread":
      return action.name || "No name set";
    case "set_variable":
      return `${action.varName} = ${action.value.slice(0, 20)}`;
    case "stop":
      return action.content ? action.content.slice(0, 30) : "Stop flow";
    default:
      return "No configuration";
  }
}

function getConditionSummary(condition: import("./types").ConditionNode): string {
  switch (condition.operator) {
    case "equal":
      return "Equals comparison";
    case "and":
      return "All conditions must be true";
    case "or":
      return "At least one must be true";
    case "not":
      return "Condition must be false";
    case "member_has_role":
      return "Check if member has role";
    case "member_has_permission":
      return "Check permission";
    case "greater_than":
      return "Greater than comparison";
    case "less_than":
      return "Less than comparison";
    default:
      return `${condition.operator} condition`;
  }
}
