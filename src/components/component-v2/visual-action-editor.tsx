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
  Zap,
  FileText,
} from "lucide-react";
import type {
  ActionGraphDocument,
  ActionGraphNode,
  ActionGraphEdge,
  FlowActionType,
  FlowAction,
} from "./types";
import { getActionsForFlow, type ActionDefinition } from "@/components/shared/action-definitions";
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

// Grid configuration
const GRID_SIZE = 20; // pixels per grid cell
const NODE_WIDTH = 280;
const NODE_HEIGHT = 140;

// Snap position to grid
function snapToGrid(pos: Position): Position {
  return {
    x: Math.round(pos.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(pos.y / GRID_SIZE) * GRID_SIZE,
  };
}

// Calculate the best connection point on a node based on direction from source
type ConnectionSide = "top" | "bottom" | "left" | "right";

function getConnectionSide(fromNode: Position, toNode: Position): ConnectionSide {
  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;

  // Determine primary direction based on angle
  const angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180 to 180

  // Map angle to side:
  // Right: -45 to 45
  // Bottom: 45 to 135
  // Left: 135 to 180 or -180 to -135
  // Top: -135 to -45
  if (angle >= -45 && angle < 45) {
    return "right";
  } else if (angle >= 45 && angle < 135) {
    return "bottom";
  } else if (angle >= -135 && angle < -45) {
    return "top";
  } else {
    return "left";
  }
}

// Get connection point position on a node edge
function getNodeConnectionPoint(
  nodePos: Position,
  side: ConnectionSide,
  nodeWidth: number = NODE_WIDTH,
  nodeHeight: number = NODE_HEIGHT
): Position {
  switch (side) {
    case "top":
      return { x: nodePos.x + nodeWidth / 2, y: nodePos.y };
    case "bottom":
      return { x: nodePos.x + nodeWidth / 2, y: nodePos.y + nodeHeight };
    case "left":
      return { x: nodePos.x, y: nodePos.y + nodeHeight / 2 };
    case "right":
      return { x: nodePos.x + nodeWidth, y: nodePos.y + nodeHeight / 2 };
  }
}

// Connection point configuration for sides
const SIDE_CONNECTION_POINTS: { side: ConnectionSide; label: string }[] = [
  { side: "top", label: "" },
  { side: "right", label: "" },
  { side: "bottom", label: "" },
  { side: "left", label: "" },
];

type NodeData = ActionGraphNode & {
  position: Position;
};

interface VisualActionEditorProps {
  graph: ActionGraphDocument;
  onChange: (graph: ActionGraphDocument) => void;
  serverId?: string;
  hidePalette?: boolean;
}

// ── Action Palette Items ─────────────────────────────────────────────────────

// Get actions available in flow context
const ACTION_PALETTE = getActionsForFlow().map(a => ({
  type: a.type as FlowActionType,
  label: a.label,
  icon: a.icon,
  color: a.color,
}));

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
  hidePalette = false,
}: VisualActionEditorProps) {
  // Canvas state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<Position>({ x: 0, y: 0 });

  // Node dragging state
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });

  // Connection state - supports both kind-based (bottom outputs) and side-based connections
  const [connectingFrom, setConnectingFrom] = useState<{
    nodeId: string;
    kind: "next" | "pass" | "fail" | null;
    side: ConnectionSide | null;
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

  // Ensure all nodes have positions (snap to grid)
  const nodesWithPositions = useMemo(() => {
    return graph.nodes.map((node, index) => {
      // If node has a position, snap it to grid
      if (node.position) {
        return {
          ...node,
          position: snapToGrid(node.position),
        };
      }
      // Default position with grid snapping
      return {
        ...node,
        position: snapToGrid({
          x: 100 + (index % 3) * 300,
          y: 100 + Math.floor(index / 3) * 200,
        }),
      };
    });
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

      // Snap to grid
      const snapped = snapToGrid({ x, y });
      updateNodePosition(draggingNode, snapped);
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

  const addEdge = useCallback((
    source: string,
    target: string,
    kind: "next" | "pass" | "fail"
  ) => {
    // Check if this exact edge already exists
    const existingEdge = graph.edges.find(
      (e) => e.source === source && e.target === target && e.kind === kind
    );
    if (existingEdge) return; // Don't add duplicate edges

    // Sides are calculated dynamically based on node positions, not stored
    onChange({
      ...graph,
      edges: [...graph.edges, { id: uid(), source, target, kind }],
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

    // Snap to grid
    const snapped = snapToGrid({ x, y });
    addNode(type, snapped);
  }, [addNode, pan, zoom]);

  // ── Connection Helpers ─────────────────────────────────────────────────────

  // Start connection from output (kind-based) or from side (side-based)
  const startConnectionFromKind = useCallback((nodeId: string, kind: "next" | "pass" | "fail") => {
    setConnectingFrom({ nodeId, kind, side: null });
    setDraggingToConnect(true);
  }, []);

  const startConnectionFromSide = useCallback((nodeId: string, side: ConnectionSide) => {
    setConnectingFrom({ nodeId, kind: null, side });
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
        const sourceNode = nodesWithPositions.find(n => n.id === connectingFrom.nodeId);
        const targetNode = nodesWithPositions.find(n => n.id === targetNodeId);

        if (sourceNode && targetNode) {
          // Calculate sides based on direction
          // Connections default to "next" kind
          const edgeKind = connectingFrom.kind ?? "next";
          addEdge(connectingFrom.nodeId, targetNodeId, edgeKind);
        }
      }
    }

    setConnectingFrom(null);
    setConnectingMousePos(null);
    setDraggingToConnect(false);
  }, [connectingFrom, addEdge, nodesWithPositions]);

  const completeConnection = useCallback((targetNodeId: string) => {
    if (connectingFrom && connectingFrom.nodeId !== targetNodeId) {
      const edgeKind = connectingFrom.kind ?? "next";
      addEdge(connectingFrom.nodeId, targetNodeId, edgeKind);
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
    if (node.kind === "trigger") {
      return [{ kind: "next" as const, label: "Start", color: "#5865F2", description: "Entry — automation starts here" }];
    }
    if (node.kind === "condition") {
      return [
        { kind: "pass" as const, label: "True", color: "#10b981", description: "Runs when condition is true" },
        { kind: "fail" as const, label: "False", color: "#ef4444", description: "Runs when condition is false" },
        { kind: "next" as const, label: "After", color: "#6b7280", description: "Runs after condition check" },
      ];
    }
    return [{ kind: "next" as const, label: "Next", color: "#6b7280", description: "Continues to next action" }];
  };

  const getConnectedEdges = (nodeId: string, kind: "next" | "pass" | "fail") => {
    return graph.edges.filter((e) => e.source === nodeId && e.kind === kind);
  };

  const getConnectedEdge = (nodeId: string, kind: "next" | "pass" | "fail") => {
    return graph.edges.find((e) => e.source === nodeId && e.kind === kind);
  };

  const getNodeById = (nodeId: string) => {
    return nodesWithPositions.find((n) => n.id === nodeId);
  };

  // Get connection point position for a node - uses stored sides or calculates based on direction
  const getConnectionPointPos = (
    sourceNode: NodeData,
    targetNode: NodeData,
    kind: "next" | "pass" | "fail",
    storedSourceSide?: "top" | "bottom" | "left" | "right",
    storedTargetSide?: "top" | "bottom" | "left" | "right"
  ) => {
    // Use stored sides if available, otherwise calculate from direction
    const sourceSide = storedSourceSide ?? getConnectionSide(sourceNode.position, targetNode.position);
    const targetSide = storedTargetSide ?? getConnectionSide(targetNode.position, sourceNode.position);

    // Get the output point position offset based on kind (for multiple outputs like pass/fail)
    const outputs = getNodeOutputs(sourceNode);
    const index = outputs.findIndex((o) => o.kind === kind);
    const total = outputs.length;

    // Calculate offset for multiple outputs on the same side
    // This spreads pass/fail/next outputs horizontally or vertically depending on side
    let sourceOffset = { x: 0, y: 0 };
    if (total > 1) {
      const spacing = (kind === "pass" ? -1 : kind === "fail" ? 1 : 0) * 30;
      // Adjust offset based on which side the connection exits
      if (sourceSide === "bottom" || sourceSide === "top") {
        sourceOffset = { x: spacing, y: 0 };
      } else {
        sourceOffset = { x: 0, y: spacing };
      }
    }

    // Get base connection points on appropriate sides
    const baseSourcePos = getNodeConnectionPoint(
      sourceNode.position,
      sourceSide,
      NODE_WIDTH,
      NODE_HEIGHT
    );
    const targetPos = getNodeConnectionPoint(
      targetNode.position,
      targetSide,
      NODE_WIDTH,
      NODE_HEIGHT
    );

    return {
      sourcePos: { x: baseSourcePos.x + sourceOffset.x, y: baseSourcePos.y + sourceOffset.y },
      targetPos
    };
  };

  return (
    <div ref={containerRef} className="flex h-full bg-[#1e1f22]">
      {/* Left Palette - only shown when hidePalette is false */}
      {!hidePalette && (
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
      )}

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
                linear-gradient(to right, #3f414733 1px, transparent 1px),
                linear-gradient(to bottom, #3f414733 1px, transparent 1px),
                linear-gradient(to right, #3f414766 1px, transparent 1px),
                linear-gradient(to bottom, #3f414766 1px, transparent 1px)
              `,
              backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px, ${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px, ${GRID_SIZE * 5 * zoom}px ${GRID_SIZE * 5 * zoom}px, ${GRID_SIZE * 5 * zoom}px ${GRID_SIZE * 5 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`,
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
              {graph.edges.map((edge, edgeIndex) => {
                const sourceNode = getNodeById(edge.source);
                const targetNode = getNodeById(edge.target);
                if (!sourceNode || !targetNode) return null;

                // Calculate offset for fan-out (multiple edges from same source/kind)
                const siblingEdges = graph.edges.filter(
                  (e) => e.source === edge.source && e.kind === edge.kind
                );
                const siblingIndex = siblingEdges.findIndex((e) => e.id === edge.id);
                const totalSiblings = siblingEdges.length;

                // Always calculate sides dynamically based on current node positions
                const sourceSide = getConnectionSide(sourceNode.position, targetNode.position);
                const targetSide = getConnectionSide(targetNode.position, sourceNode.position);

                // Get smart connection points based on dynamically calculated sides
                const { sourcePos: baseStartPos, targetPos: baseEndPos } = getConnectionPointPos(
                  sourceNode,
                  targetNode,
                  edge.kind,
                  sourceSide,
                  targetSide
                );

                // Offset start position for multiple edges based on connection side
                const siblingOffset = totalSiblings > 1
                  ? (siblingIndex - (totalSiblings - 1) / 2) * 8
                  : 0;

                let startPos = { ...baseStartPos };
                let endPos = { ...baseEndPos };

                // Apply offset perpendicular to the connection direction
                if (sourceSide === "top" || sourceSide === "bottom") {
                  startPos.x += siblingOffset;
                } else {
                  startPos.y += siblingOffset;
                }

                if (targetSide === "top" || targetSide === "bottom") {
                  endPos.x += siblingOffset;
                } else {
                  endPos.y += siblingOffset;
                }

                const color = getEdgeColor(edge.kind);
                const markerId = edge.kind === "pass" ? "url(#arrowhead-pass)" : edge.kind === "fail" ? "url(#arrowhead-fail)" : "url(#arrowhead)";

                // Control point offsets based on connection sides
                const curveOffset = 50;
                let cp1x = startPos.x;
                let cp1y = startPos.y;
                let cp2x = endPos.x;
                let cp2y = endPos.y;

                // Source control point extends outward from source side
                if (sourceSide === "bottom") {
                  cp1y += curveOffset;
                } else if (sourceSide === "top") {
                  cp1y -= curveOffset;
                } else if (sourceSide === "right") {
                  cp1x += curveOffset;
                } else {
                  cp1x -= curveOffset;
                }

                // Target control point extends outward from target side
                if (targetSide === "top") {
                  cp2y -= curveOffset;
                } else if (targetSide === "bottom") {
                  cp2y += curveOffset;
                } else if (targetSide === "right") {
                  cp2x += curveOffset;
                } else {
                  cp2x -= curveOffset;
                }

                const path = `M ${startPos.x} ${startPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endPos.x} ${endPos.y}`;

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
              {connectingFrom && connectingMousePos && (() => {
                const sourceNode = getNodeById(connectingFrom.nodeId);
                if (!sourceNode) return null;

                let startPos: Position;

                if (connectingFrom.side) {
                  // Side-based connection - start from the center of that side
                  startPos = getNodeConnectionPoint(sourceNode.position, connectingFrom.side);
                } else if (connectingFrom.kind) {
                  // Kind-based connection - start from the output button position
                  const outputs = getNodeOutputs(sourceNode);
                  const index = outputs.findIndex((o) => o.kind === connectingFrom.kind);
                  const total = outputs.length;
                  const spacing = NODE_WIDTH / (total + 1);
                  startPos = {
                    x: sourceNode.position.x + spacing * (index + 1),
                    y: sourceNode.position.y + NODE_HEIGHT,
                  };
                } else {
                  // Default to center of node
                  startPos = {
                    x: sourceNode.position.x + NODE_WIDTH / 2,
                    y: sourceNode.position.y + NODE_HEIGHT / 2,
                  };
                }

                const strokeColor = connectingFrom.kind ? getEdgeColor(connectingFrom.kind) : "#5865F2";

                return (
                  <line
                    x1={startPos.x}
                    y1={startPos.y}
                    x2={connectingMousePos.x}
                    y2={connectingMousePos.y}
                    stroke={strokeColor}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })()}
            </svg>

            {/* Nodes */}
            {nodesWithPositions.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isEntry = graph.entry_node_id === node.id;
              const isTrigger = node.kind === "trigger";
              const isAction = node.kind === "action";
              const isCondition = node.kind === "condition";
              const isModalField = node.kind === "modal_field";

              // Determine action type based on node kind
              let actionType: string;
              if (isTrigger) {
                actionType = "trigger";
              } else if (isCondition) {
                actionType = "check";
              } else if (isAction && node.action) {
                actionType = node.action.type;
              } else if (isModalField) {
                actionType = "modal_field";
              } else {
                actionType = "unknown";
              }

              // Get icon and color for each node type
              let Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
              let color: string;
              if (isTrigger) {
                Icon = Zap;
                color = "#5865F2";
              } else if (isCondition) {
                Icon = GitBranch;
                color = "#f59e0b";
              } else if (isModalField) {
                Icon = FileText;
                color = "#5865F2";
              } else {
                const paletteItem = ACTION_PALETTE.find((a) => a.type === actionType);
                Icon = paletteItem?.icon || Play;
                color = paletteItem?.color || "#6b7280";
              }

              const outputs = getNodeOutputs(node);
              const isConnectionTarget = connectingFrom && connectingFrom.nodeId !== node.id;

              // Count incoming edges to show input indicators
              const incomingEdges = graph.edges.filter((e) => e.target === node.id);

              return (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  className={cn(
                    "absolute rounded-lg border-2 transition-all select-none group",
                    isSelected
                      ? "border-[#5865F2] shadow-lg shadow-[#5865F2]/20"
                      : "border-[#3f4147] hover:border-[#5865F2]/50",
                    isEntry && "ring-2 ring-[#f59e0b] ring-offset-2 ring-offset-[#1e1f22]",
                    isConnectionTarget && "ring-2 ring-[#5865F2] cursor-pointer"
                  )}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    width: `${NODE_WIDTH}px`,
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
                      {isTrigger
                        ? node.label || (node.triggerType === "TIME" ? `Trigger: ${node.cronExpression ?? "Time-based"}` : `Trigger: ${node.eventType ?? "Event"}`)
                        : isCondition
                          ? "Check Condition"
                          : isModalField
                            ? node.fieldLabel || `Field: ${node.fieldId}`
                            : isAction && node.action
                              ? actionLabel(node.action)
                              : "Action"}
                    </span>
                    {isEntry && (
                      <span className="text-[10px] bg-[#5865F2] text-white px-1.5 py-0.5 rounded font-semibold">
                        {isTrigger ? "TRIGGER" : "START"}
                      </span>
                    )}
                    {!isTrigger && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNode(node.id);
                        }}
                        className="text-[#b5bac1] hover:text-red-400 p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Node Body */}
                  <div className="p-3">
                    {node.kind === "trigger" && (
                      <div className="space-y-1">
                        <div className="text-xs text-[#b5bac1]">
                          {node.triggerType === "TIME" ? (
                            <span className="font-mono">{node.cronExpression ?? "—"}</span>
                          ) : (
                            <span>{node.eventType ?? "—"}</span>
                          )}
                        </div>
                        {node.filters && node.filters.length > 0 && (
                          <div className="text-[10px] text-[#5865F2]">
                            {node.filters.length} filter{node.filters.length !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    )}
                    {node.kind === "action" && node.action && (
                      <div className="text-xs text-[#b5bac1] truncate">
                        {getActionSummary(node.action)}
                      </div>
                    )}
                    {node.kind === "action" && !node.action && (
                      <div className="text-xs text-[#b5bac1]">
                        No action configured
                      </div>
                    )}
                    {node.kind === "condition" && (
                      <div className="text-xs text-[#b5bac1]">
                        {node.condition ? getConditionSummary(node.condition) : "No condition configured"}
                      </div>
                    )}
                    {node.kind === "modal_field" && (
                      <div className="space-y-1">
                        <div className="text-xs text-[#b5bac1]">
                          {node.fieldType || "text"}
                          {node.isRequired && <span className="text-[#f23f42] ml-1">*</span>}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Output Connection Points (bottom) - for kind-based connections */}
                  <div className="flex justify-around pb-2">
                    {outputs.map(({ kind, label, color: outputColor, description }) => {
                      const connectedEdges = getConnectedEdges(node.id, kind);
                      const hasConnections = connectedEdges.length > 0;
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
                              startConnectionFromKind(node.id, kind);
                            }
                          }}
                          title={description}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full border-2 transition-all cursor-crosshair select-none",
                              hasConnections
                                ? "bg-current border-current"
                                : "bg-[#1e1f22] border-current group-hover:scale-125 group-hover:shadow-lg",
                              isConnecting && "animate-pulse scale-125"
                            )}
                            style={{ color: outputColor }}
                          />
                          {label && (
                            <span className="text-[10px] text-[#b5bac1] font-medium select-none pointer-events-none">{label}</span>
                          )}
                          {/* Connection count indicator - show count when multiple edges */}
                          {hasConnections && (
                            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#5865F2] rounded-full pointer-events-none flex items-center justify-center text-[10px] text-white font-semibold">
                              {connectedEdges.length > 1 ? connectedEdges.length : ""}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Side Connection Points - draw.io style */}
                  {/* Top connection point */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 -top-2 w-4 h-4 rounded-full bg-[#1e1f22] border-2 border-[#5865F2] opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair flex items-center justify-center"
                    style={{ pointerEvents: isConnectionTarget ? 'none' : 'auto' }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startConnectionFromSide(node.id, "top");
                    }}
                  >
                    <ArrowRight className="w-2.5 h-2.5 text-[#5865F2] -rotate-90" />
                  </div>

                  {/* Bottom connection point */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 rounded-full bg-[#1e1f22] border-2 border-[#5865F2] opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair flex items-center justify-center"
                    style={{ pointerEvents: isConnectionTarget ? 'none' : 'auto' }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startConnectionFromSide(node.id, "bottom");
                    }}
                  >
                    <ArrowRight className="w-2.5 h-2.5 text-[#5865F2] rotate-90" />
                  </div>

                  {/* Left connection point */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 rounded-full bg-[#1e1f22] border-2 border-[#5865F2] opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair flex items-center justify-center"
                    style={{ pointerEvents: isConnectionTarget ? 'none' : 'auto' }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startConnectionFromSide(node.id, "left");
                    }}
                  >
                    <ArrowRight className="w-2.5 h-2.5 text-[#5865F2] -rotate-180" />
                  </div>

                  {/* Right connection point */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 rounded-full bg-[#1e1f22] border-2 border-[#5865F2] opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair flex items-center justify-center"
                    style={{ pointerEvents: isConnectionTarget ? 'none' : 'auto' }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      startConnectionFromSide(node.id, "right");
                    }}
                  >
                    <ArrowRight className="w-2.5 h-2.5 text-[#5865F2]" />
                  </div>

                  {/* Input Connection Indicators - shows where connections can land */}
                  {isConnectionTarget && (
                    <>
                      {/* Top input */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 -top-2 w-4 h-4 rounded-full bg-[#5865F2] border-2 border-white shadow-lg animate-pulse"
                        style={{ pointerEvents: 'none' }}
                      />
                      {/* Left input */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 rounded-full bg-[#5865F2] border-2 border-white shadow-lg animate-pulse"
                        style={{ pointerEvents: 'none' }}
                      />
                      {/* Right input */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 rounded-full bg-[#5865F2] border-2 border-white shadow-lg animate-pulse"
                        style={{ pointerEvents: 'none' }}
                      />
                    </>
                  )}
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
                            serverId={serverId}
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
