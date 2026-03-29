"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ElementSidebar } from "@/components/elements/element-sidebar";
import { ChevronLeft, ChevronRight, PanelLeft, MousePointer2, GitBranch, Check, X, ArrowRight, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ensureActionGraph, actionGraphToLegacyFlow, isLinearizableGraph, legacyFlowToGraph } from "./action-graph";
import { makeAction, ActionCard, AddActionDropdown, computeErrors, actionLabel } from "./flow-editor";
import { ActionFields } from "./action-fields";
import { VisualActionEditor } from "./visual-action-editor";
import { ConditionBuilder, createCondition } from "./condition-builder";
import type {
  ActionGraphDocument,
  ActionGraphEdgeKind,
  ActionGraphNode,
  FlowAction,
  FlowActionType,
} from "./types";

function uid() {
  return crypto.randomUUID();
}

interface ActionEditorWorkbenchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId?: string;
  title?: string;
  actions: FlowAction[];
  graph?: ActionGraphDocument;
  onSave: (payload: { graph: ActionGraphDocument; flow: FlowAction[] }) => void;
}

export function ActionEditorWorkbench({
  open,
  onOpenChange,
  serverId,
  title = "Action Editor",
  actions,
  graph,
  onSave,
}: ActionEditorWorkbenchProps) {
  const [mode, setMode] = useState<"linear" | "node">("linear");
  const [draftGraph, setDraftGraph] = useState<ActionGraphDocument>(() => ensureActionGraph(actions, graph, { skipTrigger: true }));
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(graph?.entry_node_id);
  const [leftPanelOpen, setLeftPanelOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("action-editor-panel-open") !== "false";
    }
    return true;
  });

  // Persist panel state
  useEffect(() => {
    localStorage.setItem("action-editor-panel-open", String(leftPanelOpen));
  }, [leftPanelOpen]);

  useEffect(() => {
    if (!open) return;
    const nextGraph = ensureActionGraph(actions, graph, { skipTrigger: true });
    setDraftGraph(nextGraph);
    setSelectedNodeId(nextGraph.entry_node_id);
    setMode(isLinearizableGraph(nextGraph) ? "linear" : "node");
  }, [open, actions, graph]);

  const linearActions = useMemo(() => actionGraphToLegacyFlow(draftGraph), [draftGraph]);
  const linearErrors = computeErrors(linearActions ?? []);
  const selectedNode = draftGraph.nodes.find((node) => node.id === selectedNodeId);

  function updateLinearActions(nextActions: FlowAction[]) {
    setDraftGraph(legacyFlowToGraph(nextActions));
  }

  function saveAndClose() {
    const flow = actionGraphToLegacyFlow(draftGraph) ?? [];
    onSave({ graph: draftGraph, flow });
    onOpenChange(false);
  }

  function upsertNode(node: ActionGraphNode) {
    setDraftGraph((current) => ({
      ...current,
      nodes: current.nodes.map((item) => (item.id === node.id ? node : item)),
    }));
  }

  function removeNode(nodeId: string) {
    setDraftGraph((current) => {
      const nextNodes = current.nodes.filter((node) => node.id !== nodeId);
      const nextEdges = current.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
      return {
        ...current,
        entry_node_id: current.entry_node_id === nodeId ? nextNodes[0]?.id : current.entry_node_id,
        nodes: nextNodes,
        edges: nextEdges,
      };
    });
    setSelectedNodeId(undefined);
  }

  function addNode(kind: "action" | "condition", actionType: FlowActionType = "do_nothing") {
    const node: ActionGraphNode =
      kind === "action"
        ? { id: uid(), kind, action: makeAction(actionType), position: { x: 0, y: 0 } }
        : { id: uid(), kind, position: { x: 0, y: 0 } };

    setDraftGraph((current) => ({
      ...current,
      entry_node_id: current.entry_node_id ?? node.id,
      nodes: [...current.nodes, node],
    }));
    setSelectedNodeId(node.id);
    setMode("node");
  }

  function setEdge(source: string, kind: ActionGraphEdgeKind, target?: string) {
    setDraftGraph((current) => {
      const nextEdges = current.edges.filter((edge) => !(edge.source === source && edge.kind === kind));
      if (target) {
        nextEdges.push({ id: uid(), source, target, kind });
      }
      return { ...current, edges: nextEdges };
    });
  }

  const nodeOptions = draftGraph.nodes.map((node) => ({
    id: node.id,
    label: node.kind === "action" ? node.action.type : "condition",
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] h-[96vh] overflow-hidden p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="flex h-full flex-col bg-[#1e1f22] text-white">
          <div className="flex items-center justify-between border-b border-[#3f4147] px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-sm text-[#b5bac1]">Draft-based editor with linear and node views.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-md border border-[#3f4147] bg-[#111214] p-1">
                {(["linear", "node"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMode(value)}
                    className={cn(
                      "rounded px-3 py-1.5 text-sm capitalize transition-colors",
                      mode === value ? "bg-[#5865F2] text-white" : "text-[#b5bac1] hover:text-white"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={saveAndClose}>Save</Button>
            </div>
          </div>

          <div
            className="grid min-h-0 flex-1 gap-0"
            style={{
              gridTemplateColumns:
                mode === "node"
                  ? leftPanelOpen
                    ? "320px 1fr 320px"
                    : "48px 1fr 320px"
                  : "320px 1fr",
            }}
          >
            {/* Left Panel - Elements */}
            <div className="min-h-0 border-r border-[#3f4147] bg-[#2b2d31] flex flex-col">
              <button
                onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                className="w-full h-10 flex items-center justify-center border-b border-[#3f4147] hover:bg-[#3f4147] transition-colors"
                title={leftPanelOpen ? "Hide elements panel" : "Show elements panel"}
              >
                <PanelLeft className={cn("w-5 h-5", !leftPanelOpen && "rotate-180")} />
              </button>
              {serverId && leftPanelOpen ? (
                <div className="flex-1 p-4 overflow-hidden">
                  <ElementSidebar serverId={serverId} className="h-full border-[#3f4147] bg-[#2b2d31]" />
                </div>
              ) : null}
            </div>

            {/* Center - Canvas */}
            <div className="min-h-0 border-r border-[#3f4147]">
              {mode === "linear" ? (
                <LinearActionPane
                  disabled={!linearActions}
                  errors={linearErrors}
                  actions={linearActions ?? []}
                  serverId={serverId}
                  onChange={updateLinearActions}
                  onSwitchToNode={() => setMode("node")}
                />
              ) : (
                <VisualActionEditor
                  graph={draftGraph}
                  onChange={setDraftGraph}
                  serverId={serverId}
                />
              )}
            </div>

            {/* Right Panel - Only in node mode */}
            {mode === "node" && (
              <div className="min-h-0 bg-[#232428]">
                <NodeInspector
                  serverId={serverId}
                  selectedNode={selectedNode}
                  nodeOptions={nodeOptions}
                  graph={draftGraph}
                  onNodeChange={upsertNode}
                  onRemoveNode={removeNode}
                  onSetEdge={setEdge}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LinearActionPane({
  disabled,
  errors,
  actions,
  serverId,
  onChange,
  onSwitchToNode,
}: {
  disabled: boolean;
  errors: string[];
  actions: FlowAction[];
  serverId?: string;
  onChange: (actions: FlowAction[]) => void;
  onSwitchToNode: () => void;
}) {
  function updateAction(idx: number, updated: FlowAction) {
    onChange(actions.map((action, index) => (index === idx ? updated : action)));
  }

  function moveAction(idx: number, direction: -1 | 1) {
    const next = [...actions];
    const target = idx + direction;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  function duplicateAction(idx: number) {
    const action = { ...actions[idx], id: uid() };
    const next = [...actions];
    next.splice(idx + 1, 0, action);
    onChange(next);
  }

  function removeAction(idx: number) {
    onChange(actions.filter((_, index) => index !== idx));
  }

  if (disabled) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div>
          <p className="text-lg font-semibold">Linear mode unavailable</p>
          <p className="mt-2 text-sm text-[#b5bac1]">
            This graph uses joins, cycles, or shared downstream nodes. Continue editing it in node mode.
          </p>
        </div>
        <Button onClick={onSwitchToNode}>Open Node Mode</Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-6">
        {errors.length > 0 && (
          <div className="rounded-md border border-yellow-600 bg-yellow-900/20 p-3 text-sm text-yellow-200">
            {errors.join(", ")}
          </div>
        )}
        {actions.map((action, index) => (
          <ActionCard
            key={action.id}
            action={action}
            index={index}
            total={actions.length}
            serverId={serverId}
            onChange={(updated) => updateAction(index, updated)}
            onMoveUp={() => moveAction(index, -1)}
            onMoveDown={() => moveAction(index, 1)}
            onDuplicate={() => duplicateAction(index)}
            onDelete={() => removeAction(index)}
          />
        ))}
        <AddActionDropdown onAdd={(type) => onChange([...actions, makeAction(type)])} />
      </div>
    </ScrollArea>
  );
}

function NodeInspector({
  serverId,
  selectedNode,
  nodeOptions,
  graph,
  onNodeChange,
  onRemoveNode,
  onSetEdge,
}: {
  serverId?: string;
  selectedNode?: ActionGraphNode;
  nodeOptions: { id: string; label: string }[];
  graph: ActionGraphDocument;
  onNodeChange: (node: ActionGraphNode) => void;
  onRemoveNode: (nodeId: string) => void;
  onSetEdge: (source: string, kind: ActionGraphEdgeKind, target?: string) => void;
}) {
  const edges = selectedNode ? graph.edges.filter((edge) => edge.source === selectedNode.id) : [];
  const nextTarget = edges.find((edge) => edge.kind === "next")?.target;
  const passTarget = edges.find((edge) => edge.kind === "pass")?.target;
  const failTarget = edges.find((edge) => edge.kind === "fail")?.target;

  if (!selectedNode) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#2b2d31] flex items-center justify-center mb-4">
          <MousePointer2 className="w-8 h-8 text-[#b5bac1]" />
        </div>
        <p className="text-sm font-medium text-white mb-1">No Node Selected</p>
        <p className="text-xs text-[#b5bac1]">
          Click on a node in the canvas to edit its properties and connections.
        </p>
      </div>
    );
  }

  const getEdgeColor = (kind: ActionGraphEdgeKind) => {
    switch (kind) {
      case "pass": return "#10b981";
      case "fail": return "#ef4444";
      case "next": default: return "#6b7280";
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-5 p-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: selectedNode.kind === "action" ? "#5865F2" : "#8b5cf6" }}
            />
            <div>
              <p className="text-sm font-semibold text-white">
                {selectedNode.kind === "action" ? selectedNode.action.type.replace(/_/g, " ") : "Check Condition"}
              </p>
              <p className="text-xs text-[#b5bac1]">ID: {selectedNode.id.slice(0, 8)}...</p>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={() => onRemoveNode(selectedNode.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Configuration Section */}
        <div className="space-y-3">
          <Label className="text-xs text-[#b5bac1] uppercase tracking-wide">Configuration</Label>

          {selectedNode.kind === "action" ? (
            <div className="border border-[#3f4147] rounded-md p-4 bg-[#1e1f22]">
              <ActionFields
                action={selectedNode.action}
                onChange={(updated: FlowAction) => onNodeChange({ ...selectedNode, action: updated })}
                serverId={serverId}
              />
            </div>
          ) : selectedNode.kind === "condition" ? (
            <div className="space-y-3">
              <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 rounded-md p-3">
                <div className="flex items-center gap-2 text-[#8b5cf6] mb-1">
                  <GitBranch className="w-4 h-4" />
                  <span className="text-sm font-medium">If/Else Branch</span>
                </div>
                <p className="text-xs text-[#b5bac1]">
                  This node splits the flow. Use the connection selectors below to set where each branch goes.
                </p>
              </div>
              <div className="border border-[#3f4147] rounded-md p-3 bg-[#1e1f22]">
                <ConditionBuilder
                  condition={selectedNode.condition ?? createCondition("equal")}
                  onChange={(updated) => updated && onNodeChange({ ...selectedNode, condition: updated })}
                  serverId={serverId}
                />
              </div>
              {!selectedNode.condition && (
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm" onClick={() => onNodeChange({ ...selectedNode, condition: createCondition("equal") })}>
                    + Equal
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onNodeChange({ ...selectedNode, condition: createCondition("and") })}>
                    + And
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onNodeChange({ ...selectedNode, condition: createCondition("member_has_role") })}>
                    + Has Role
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // trigger node — no action config
            <div className="text-sm text-[#b5bac1]">
              Configure the trigger in the left panel.
            </div>
          )}
        </div>

        {/* Connections Section */}
        <div className="space-y-3">
          <Label className="text-xs text-[#b5bac1] uppercase tracking-wide">Connections</Label>

          <div className="space-y-2">
            {selectedNode.kind === "action" ? (
              <ConnectionSelect
                label="Next"
                description="Continue to next action"
                value={nextTarget}
                options={nodeOptions}
                sourceId={selectedNode.id}
                kind="next"
                color={getEdgeColor("next")}
                onSetEdge={onSetEdge}
              />
            ) : (
              <>
                <ConnectionSelect
                  label="If True"
                  description="When condition passes"
                  value={passTarget}
                  options={nodeOptions}
                  sourceId={selectedNode.id}
                  kind="pass"
                  color={getEdgeColor("pass")}
                  onSetEdge={onSetEdge}
                />
                <ConnectionSelect
                  label="If False"
                  description="When condition fails"
                  value={failTarget}
                  options={nodeOptions}
                  sourceId={selectedNode.id}
                  kind="fail"
                  color={getEdgeColor("fail")}
                  onSetEdge={onSetEdge}
                />
                <ConnectionSelect
                  label="After Check"
                  description="Always continue here after condition"
                  value={nextTarget}
                  options={nodeOptions}
                  sourceId={selectedNode.id}
                  kind="next"
                  color={getEdgeColor("next")}
                  onSetEdge={onSetEdge}
                />
              </>
            )}
          </div>
        </div>

        {/* Help Section */}
        {selectedNode.kind === "condition" && (
          <div className="bg-[#2b2d31] rounded-md p-3 border border-[#3f4147]">
            <p className="text-xs text-[#b5bac1] mb-2">How If/Else Works:</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                <span className="text-xs text-white">True (Green) - Condition matches</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                <span className="text-xs text-white">False (Red) - Condition fails</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#6b7280]" />
                <span className="text-xs text-white">After (Grey) - Always runs after</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function ConnectionSelect({
  label,
  description,
  value,
  options,
  sourceId,
  kind,
  color,
  onSetEdge,
}: {
  label: React.ReactNode;
  description?: string;
  value?: string;
  options: { id: string; label: string }[];
  sourceId: string;
  kind: ActionGraphEdgeKind;
  color: string;
  onSetEdge: (source: string, kind: ActionGraphEdgeKind, target?: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm text-white flex items-center gap-2">{label}</Label>
        {value && (
          <button
            onClick={() => onSetEdge(sourceId, kind, undefined)}
            className="text-[10px] text-red-400 hover:text-red-300"
          >
            Clear
          </button>
        )}
      </div>
      {description && <p className="text-[10px] text-[#b5bac1]">{description}</p>}
      <select
        value={value ?? ""}
        onChange={(e) => onSetEdge(sourceId, kind, e.target.value || undefined)}
        className="w-full rounded-md border border-[#3f4147] bg-[#1e1f22] px-3 py-2 text-sm text-white outline-none focus:border-[#5865F2]"
        style={{ borderLeftWidth: "3px", borderLeftColor: value ? color : "transparent" }}
      >
        <option value="">No connection</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label} ({option.id.slice(0, 8)})
          </option>
        ))}
      </select>
    </div>
  );
}

function EdgeSelect({
  label,
  value,
  options,
  sourceId,
  kind,
  onSetEdge,
}: {
  label: string;
  value?: string;
  options: { id: string; label: string }[];
  sourceId: string;
  kind: ActionGraphEdgeKind;
  onSetEdge: (source: string, kind: ActionGraphEdgeKind, target?: string) => void;
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <select
        value={value ?? ""}
        onChange={(e) => onSetEdge(sourceId, kind, e.target.value || undefined)}
        className="w-full rounded-md border border-[#3f4147] bg-[#1e1f22] px-3 py-2 text-sm text-white outline-none"
      >
        <option value="">No connection</option>
        {options
          .filter((option) => option.id !== sourceId)
          .map((option) => (
            <option key={option.id} value={option.id}>
              {option.label} ({option.id.slice(0, 8)})
            </option>
          ))}
      </select>
    </div>
  );
}
