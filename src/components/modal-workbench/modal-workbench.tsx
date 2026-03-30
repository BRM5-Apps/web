"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ElementSidebar } from "@/components/elements/element-sidebar";
import { ElementInsertionProvider } from "@/components/elements/element-insertion-provider";
import { PanelLeft, MousePointer2 } from "lucide-react";
import type {
  ActionGraphDocument,
  ActionGraphNode,
  ActionGraphModalFieldNode,
  FlowAction,
  ModalSettings,
  ModalComponentType,
} from "../component-v2/types";
import { VisualActionEditor } from "../component-v2/visual-action-editor";
import { LinearModalPane, type ModalField } from "./field-action-card";
import {
  createDefaultModalGraph,
  settingsToActions,
  actionsToSettings,
  syncSettingsToGraph,
} from "./modal-settings-sync";

function uid(): string {
  return crypto.randomUUID();
}

interface ModalWorkbenchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId?: string;
  modalName?: string;
  fields: ModalField[];
  graph?: ActionGraphDocument;
  settings?: ModalSettings;
  onSave: (payload: { graph: ActionGraphDocument; settings: ModalSettings }) => void;
}

export function ModalWorkbench({
  open,
  onOpenChange,
  serverId,
  modalName = "Modal",
  fields,
  graph: initialGraph,
  settings: initialSettings,
  onSave,
}: ModalWorkbenchProps) {
  const [mode, setMode] = useState<"linear" | "node">("linear");
  const [draftGraph, setDraftGraph] = useState<ActionGraphDocument>(() =>
    initializeGraph(fields, initialGraph)
  );
  const [draftSettings, setDraftSettings] = useState<ModalSettings>(
    initialSettings ?? {}
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [leftPanelOpen, setLeftPanelOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("modal-workbench-panel-open") !== "false";
    }
    return true;
  });

  // Persist panel state
  useEffect(() => {
    localStorage.setItem("modal-workbench-panel-open", String(leftPanelOpen));
  }, [leftPanelOpen]);

  // Reset draft when props change
  useEffect(() => {
    if (!open) return;
    setDraftGraph(initializeGraph(fields, initialGraph));
    setDraftSettings(initialSettings ?? {});
    setSelectedNodeId(undefined);
  }, [open, fields, initialGraph, initialSettings]);

  function initializeGraph(
    fields: ModalField[],
    existingGraph?: ActionGraphDocument
  ): ActionGraphDocument {
    if (existingGraph && existingGraph.nodes.length > 0) {
      return existingGraph;
    }

    // Create default graph with field nodes
    const { graph } = createDefaultModalGraph(
      fields.map((f) => ({
        id: f.id,
        label: f.label,
        type: f.type,
        required: f.required,
      }))
    );

    return graph;
  }

  // Sync settings to graph when settings change
  function handleSettingsChange(newSettings: ModalSettings) {
    setDraftSettings(newSettings);
    const updatedGraph = syncSettingsToGraph(draftGraph, newSettings);
    setDraftGraph(updatedGraph);
  }

  // Sync graph to settings when graph changes
  function handleGraphChange(newGraph: ActionGraphDocument) {
    setDraftGraph(newGraph);
    // Extract settings from action nodes connected to the settings virtual node
    const settingsActions: FlowAction[] = [];
    const settingsNode = newGraph.nodes.find(
      (n) => n.kind === "modal_field" && (n as ActionGraphModalFieldNode).fieldId === "settings"
    );

    if (settingsNode) {
      // Collect all actions connected to settings node
      const visited = new Set<string>();
      const collectActions = (nodeId: string) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        const outgoingEdges = newGraph.edges.filter((e) => e.source === nodeId);
        for (const edge of outgoingEdges) {
          const targetNode = newGraph.nodes.find((n) => n.id === edge.target);
          if (targetNode?.kind === "action") {
            settingsActions.push((targetNode as any).action);
          }
          collectActions(edge.target);
        }
      };

      collectActions(settingsNode.id);
    }

    const extractedSettings = actionsToSettings(settingsActions);
    setDraftSettings(extractedSettings);
  }

  function saveAndClose() {
    onSave({ graph: draftGraph, settings: draftSettings });
    onOpenChange(false);
  }

  // Get field nodes for display
  const fieldNodes = useMemo(() => {
    return draftGraph.nodes
      .filter((n) => n.kind === "modal_field")
      .map((n) => n as ActionGraphModalFieldNode);
  }, [draftGraph]);

  // Get selected node
  const selectedNode = draftGraph.nodes.find((n) => n.id === selectedNodeId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98vw] h-[96vh] overflow-hidden p-0">
        <DialogTitle className="sr-only">
          {modalName} Flow Editor
        </DialogTitle>
        <div className="flex h-full flex-col bg-[#1e1f22] text-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#3f4147] px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold">{modalName} Flow Editor</h2>
              <p className="text-sm text-[#b5bac1]">
                Attach actions to modal fields. Actions run when the form is submitted.
              </p>
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
                      mode === value
                        ? "bg-[#5865F2] text-white"
                        : "text-[#b5bac1] hover:text-white"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={saveAndClose}>Save</Button>
            </div>
          </div>

          {/* Main Content */}
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
                <PanelLeft
                  className={cn("w-5 h-5", !leftPanelOpen && "rotate-180")}
                />
              </button>
              {serverId && leftPanelOpen ? (
                <div className="flex-1 p-4 overflow-hidden">
                  <ElementInsertionProvider>
                    <ElementSidebar
                      serverId={serverId}
                      className="h-full border-[#3f4147] bg-[#2b2d31]"
                    />
                  </ElementInsertionProvider>
                </div>
              ) : null}
            </div>

            {/* Center - Editor */}
            <div className="min-h-0 border-r border-[#3f4147]">
              {mode === "linear" ? (
                <LinearModalPane
                  fields={fields}
                  graph={draftGraph}
                  serverId={serverId}
                  onGraphChange={handleGraphChange}
                />
              ) : (
                <VisualActionEditor
                  graph={draftGraph}
                  onChange={handleGraphChange}
                  serverId={serverId}
                />
              )}
            </div>

            {/* Right Panel - Node Inspector (only in node mode) */}
            {mode === "node" && (
              <div className="min-h-0 bg-[#232428]">
                <NodeInspector
                  serverId={serverId}
                  selectedNode={selectedNode}
                  fieldNodes={fieldNodes}
                  onSelectNode={setSelectedNodeId}
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function NodeInspector({
  serverId,
  selectedNode,
  fieldNodes,
  onSelectNode,
}: {
  serverId?: string;
  selectedNode?: ActionGraphNode;
  fieldNodes: ActionGraphModalFieldNode[];
  onSelectNode: (nodeId: string | undefined) => void;
}) {
  if (!selectedNode) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#2b2d31] flex items-center justify-center mb-4">
          <MousePointer2 className="w-8 h-8 text-[#b5bac1]" />
        </div>
        <p className="text-sm font-medium text-white mb-1">No Node Selected</p>
        <p className="text-xs text-[#b5bac1]">
          Click on a field or action node to edit its properties.
        </p>
        {fieldNodes.length > 0 && (
          <div className="mt-4 w-full">
            <p className="text-xs text-[#b5bac1] mb-2">Field Nodes:</p>
            <div className="space-y-1">
              {fieldNodes.map((field) => (
                <button
                  key={field.id}
                  onClick={() => onSelectNode(field.id)}
                  className="w-full text-left px-3 py-2 rounded bg-[#2b2d31] hover:bg-[#3f4147] transition-colors"
                >
                  <p className="text-sm text-white">{field.fieldLabel}</p>
                  <p className="text-xs text-[#b5bac1]">{field.fieldType}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render inspector based on node kind
  const nodeKind = selectedNode.kind;
  let nodeColor = "#5865F2"; // Default blue for actions
  let nodeLabel = "Action";

  if (nodeKind === "modal_field") {
    const fieldNode = selectedNode as ActionGraphModalFieldNode;
    nodeColor = getFieldColor(fieldNode.fieldType);
    nodeLabel = fieldNode.fieldLabel;
  } else if (nodeKind === "condition") {
    nodeColor = "#8b5cf6"; // Purple for conditions
    nodeLabel = "Condition";
  } else if (nodeKind === "trigger") {
    nodeColor = "#f59e0b"; // Orange for triggers
    nodeLabel = "Trigger";
  } else if (nodeKind === "action") {
    const actionNode = selectedNode as any;
    nodeLabel = actionNode.action?.type?.replace(/_/g, " ") ?? "Action";
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: nodeColor }}
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-white capitalize">
              {nodeLabel}
            </p>
            <p className="text-xs text-[#b5bac1]">
              ID: {selectedNode.id.slice(0, 8)}...
            </p>
          </div>
        </div>

        {/* Node-specific content */}
        {nodeKind === "modal_field" && (
          <div className="space-y-3">
            <p className="text-sm text-[#b5bac1]">
              This is a modal field node. Actions attached to this field will
              execute when the modal is submitted.
            </p>
            <div className="bg-[#2b2d31] rounded p-3 border border-[#3f4147]">
              <p className="text-xs text-[#b5bac1]">Field Value Access:</p>
              <code className="text-xs text-[#5865F2]">
                {`{{element:${(selectedNode as ActionGraphModalFieldNode).fieldLabel.toLowerCase().replace(/\s+/g, "_")}}}`}
              </code>
            </div>
          </div>
        )}

        {nodeKind === "action" && (
          <div className="text-sm text-[#b5bac1]">
            Configure this action in the visual editor.
          </div>
        )}

        {nodeKind === "condition" && (
          <div className="text-sm text-[#b5bac1]">
            Configure the condition logic in the visual editor.
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

function getFieldColor(fieldType: ModalComponentType): string {
  const colors: Record<ModalComponentType, string> = {
    "short-answer": "#5865F2",
    paragraph: "#5865F2",
    "multiple-choice": "#EB459E",
    checkboxes: "#57F287",
    dropdown: "#FEE75C",
    "text-display": "#9B59B6",
    "file-upload": "#E74C3C",
    "single-checkbox": "#57F287",
    "user-select": "#3498DB",
    "role-select": "#E91E63",
    "channel-select": "#00BCD4",
    "user-role-select": "#FF9800",
  };
  return colors[fieldType] || "#5865F2";
}

export default ModalWorkbench;