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
import { ensureActionGraph, actionGraphToLegacyFlow, isLinearizableGraph, legacyFlowToGraph } from "./action-graph";
import { makeAction, ActionCard, AddActionDropdown, computeErrors } from "./flow-editor";
import type {
  ActionGraphDocument,
  ActionGraphEdgeKind,
  ActionGraphNode,
  FlowAction,
  FlowActionType,
  FaCheck,
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
  const [draftGraph, setDraftGraph] = useState<ActionGraphDocument>(() => ensureActionGraph(actions, graph));
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(graph?.entry_node_id);

  useEffect(() => {
    if (!open) return;
    const nextGraph = ensureActionGraph(actions, graph);
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
        : { id: uid(), kind, condition: {}, position: { x: 0, y: 0 } };

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
      <DialogContent className="max-w-[96vw] h-[92vh] overflow-hidden p-0">
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

          <div className="grid min-h-0 flex-1 gap-0 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
            <div className="min-h-0 border-r border-[#3f4147] bg-[#2b2d31] p-4">
              {serverId ? <ElementSidebar serverId={serverId} className="h-full border-[#3f4147] bg-[#2b2d31]" /> : null}
            </div>

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
                <NodeCanvas
                  graph={draftGraph}
                  selectedNodeId={selectedNodeId}
                  onSelect={setSelectedNodeId}
                  onAddNode={addNode}
                />
              )}
            </div>

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

function NodeCanvas({
  graph,
  selectedNodeId,
  onSelect,
  onAddNode,
}: {
  graph: ActionGraphDocument;
  selectedNodeId?: string;
  onSelect: (nodeId: string) => void;
  onAddNode: (kind: "action" | "condition", actionType?: FlowActionType) => void;
}) {
  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <AddActionDropdown onAdd={(type) => onAddNode("action", type)} />
          <Button variant="outline" onClick={() => onAddNode("condition")}>Add Condition Node</Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {graph.nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => onSelect(node.id)}
              className={cn(
                "rounded-lg border p-4 text-left transition-colors",
                selectedNodeId === node.id
                  ? "border-[#5865F2] bg-[#5865F2]/10"
                  : "border-[#3f4147] bg-[#111214] hover:border-[#5865F2]/50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[#b5bac1]">{node.kind}</div>
                  <div className="mt-1 text-sm font-semibold">
                    {node.kind === "action" ? node.action.type : "check_condition"}
                  </div>
                </div>
                {graph.entry_node_id === node.id && (
                  <span className="rounded bg-[#5865F2] px-2 py-1 text-[10px] font-semibold uppercase">Entry</span>
                )}
              </div>
            </button>
          ))}
        </div>
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
      <div className="flex h-full items-center justify-center p-6 text-center text-sm text-[#b5bac1]">
        Select a node to edit its configuration and connections.
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{selectedNode.kind === "action" ? selectedNode.action.type : "condition"}</p>
            <p className="text-xs text-[#b5bac1]">Node ID: {selectedNode.id}</p>
          </div>
          <Button variant="destructive" size="sm" onClick={() => onRemoveNode(selectedNode.id)}>Delete</Button>
        </div>

        {selectedNode.kind === "action" ? (
          <ActionCard
            action={selectedNode.action}
            index={0}
            total={1}
            serverId={serverId}
            onChange={(updated) => onNodeChange({ ...selectedNode, action: updated })}
            onMoveUp={() => {}}
            onMoveDown={() => {}}
            onDuplicate={() => {}}
            onDelete={() => onRemoveNode(selectedNode.id)}
          />
        ) : (
          <div className="space-y-2">
            <Label>Condition JSON</Label>
            <textarea
              rows={8}
              className="w-full rounded-md border border-[#3f4147] bg-[#111214] px-3 py-2 text-sm outline-none"
              value={JSON.stringify(selectedNode.condition ?? {}, null, 2)}
              onChange={(e) => {
                try {
                  const next = JSON.parse(e.target.value || "{}");
                  onNodeChange({ ...selectedNode, condition: next });
                } catch {
                  // keep draft text externalized only on valid JSON
                }
              }}
            />
          </div>
        )}

        <div className="space-y-3 rounded-md border border-[#3f4147] bg-[#111214] p-4">
          <p className="text-sm font-semibold">Connections</p>
          {selectedNode.kind === "action" ? (
            <EdgeSelect
              label="Next"
              value={nextTarget}
              options={nodeOptions}
              sourceId={selectedNode.id}
              kind="next"
              onSetEdge={onSetEdge}
            />
          ) : (
            <>
              <EdgeSelect label="Pass" value={passTarget} options={nodeOptions} sourceId={selectedNode.id} kind="pass" onSetEdge={onSetEdge} />
              <EdgeSelect label="Fail" value={failTarget} options={nodeOptions} sourceId={selectedNode.id} kind="fail" onSetEdge={onSetEdge} />
              <EdgeSelect label="After Condition" value={nextTarget} options={nodeOptions} sourceId={selectedNode.id} kind="next" onSetEdge={onSetEdge} />
            </>
          )}
        </div>
      </div>
    </ScrollArea>
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
