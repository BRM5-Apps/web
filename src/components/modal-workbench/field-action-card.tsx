"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  ChevronDown,
  ChevronUp,
  Copy,
  Trash2,
  Plus,
  Type,
  List,
  CheckSquare,
  FileText,
  Users,
  CircleDot,
} from "lucide-react";
import type { FlowAction, FlowActionType, ModalComponentType } from "../component-v2/types";
import { AddActionDropdown, makeAction } from "../component-v2/flow-editor";
import { ActionFields } from "../component-v2/action-fields";

// Field type icons
const fieldIcons: Record<ModalComponentType, React.ReactNode> = {
  "short-answer": <Type className="w-4 h-4" />,
  paragraph: <FileText className="w-4 h-4" />,
  "multiple-choice": <CircleDot className="w-4 h-4" />,
  checkboxes: <CheckSquare className="w-4 h-4" />,
  dropdown: <List className="w-4 h-4" />,
  "text-display": <FileText className="w-4 h-4" />,
  "file-upload": <FileText className="w-4 h-4" />,
  "single-checkbox": <CheckSquare className="w-4 h-4" />,
  "user-select": <Users className="w-4 h-4" />,
  "role-select": <Users className="w-4 h-4" />,
  "channel-select": <List className="w-4 h-4" />,
  "user-role-select": <Users className="w-4 h-4" />,
};

// Field type labels
const fieldLabels: Record<ModalComponentType, string> = {
  "short-answer": "Short Answer",
  paragraph: "Paragraph",
  "multiple-choice": "Multiple Choice",
  checkboxes: "Checkboxes",
  dropdown: "Dropdown",
  "text-display": "Text Display",
  "file-upload": "File Upload",
  "single-checkbox": "Checkbox",
  "user-select": "User Select",
  "role-select": "Role Select",
  "channel-select": "Channel Select",
  "user-role-select": "Mentionable Select",
};

function uid() {
  return crypto.randomUUID();
}

export interface ModalField {
  id: string;
  type: ModalComponentType;
  label: string;
  required: boolean;
}

export interface FieldActionCardProps {
  field: ModalField;
  actions: FlowAction[];
  serverId?: string;
  onAddAction: (action: FlowAction) => void;
  onEditAction: (actionId: string, updated: FlowAction) => void;
  onRemoveAction: (actionId: string) => void;
  onMoveAction: (actionId: string, direction: "up" | "down") => void;
  onDuplicateAction: (actionId: string) => void;
  dragged?: boolean;
}

export function FieldActionCard({
  field,
  actions,
  serverId,
  onAddAction,
  onEditAction,
  onRemoveAction,
  onMoveAction,
  onDuplicateAction,
  dragged,
}: FieldActionCardProps) {
  const [expanded, setExpanded] = useState(true);

  const fieldIcon = fieldIcons[field.type] || <Type className="w-4 h-4" />;
  const fieldLabel = fieldLabels[field.type] || field.type;

  return (
    <div
      className={cn(
        "rounded-lg border border-[#3f4147] bg-[#2b2d31]",
        dragged && "opacity-50"
      )}
    >
      {/* Field Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3f4147]">
        <div className="flex items-center gap-2 text-[#b5bac1]">
          {fieldIcon}
          <span className="text-sm font-medium">{field.label}</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs px-2 py-0.5 rounded bg-[#1e1f22] text-[#b5bac1]">
            {fieldLabel}
          </span>
          {field.required && (
            <span className="text-xs px-2 py-0.5 rounded bg-[#5865F2]/20 text-[#5865F2]">
              Required
            </span>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-[#3f4147] rounded transition-colors"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-[#b5bac1]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#b5bac1]" />
            )}
          </button>
        </div>
      </div>

      {/* Actions List */}
      {expanded && (
        <div className="p-3 space-y-2">
          {actions.length === 0 ? (
            <div className="text-sm text-[#b5bac1] py-2 text-center">
              No actions attached to this field
            </div>
          ) : (
            actions.map((action, index) => (
              <ActionCardWithMove
                key={action.id}
                action={action}
                index={index}
                total={actions.length}
                serverId={serverId}
                onChange={(updated) => onEditAction(action.id, updated)}
                onMoveUp={() => onMoveAction(action.id, "up")}
                onMoveDown={() => onMoveAction(action.id, "down")}
                onDuplicate={() => onDuplicateAction(action.id)}
                onDelete={() => onRemoveAction(action.id)}
              />
            ))
          )}

          {/* Add Action Button */}
          <AddActionDropdown onAdd={(type) => onAddAction(makeAction(type))} />
        </div>
      )}
    </div>
  );
}

function ActionCardWithMove({
  action,
  index,
  total,
  serverId,
  onChange,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
}: {
  action: FlowAction;
  index: number;
  total: number;
  serverId?: string;
  onChange: (updated: FlowAction) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const actionTypeLabel = action.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="border border-[#3f4147] rounded-md bg-[#1e1f22] overflow-hidden">
      {/* Action Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#232428]">
        <GripVertical className="w-4 h-4 text-[#b5bac1] cursor-grab" />
        <span className="text-sm font-medium text-white flex-1">{actionTypeLabel}</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            disabled={index === 0}
            className="h-6 w-6 p-0"
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="h-6 w-6 p-0"
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="h-6 w-6 p-0"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button
            variant={isEditing ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="h-6 px-2"
          >
            {isEditing ? "Done" : "Edit"}
          </Button>
        </div>
      </div>

      {/* Action Configuration */}
      {isEditing && (
        <div className="p-3 border-t border-[#3f4147]">
          <ActionFields action={action} onChange={onChange} serverId={serverId} />
        </div>
      )}
    </div>
  );
}

// Linear mode pane for modal workbench
export function LinearModalPane({
  fields,
  graph,
  serverId,
  onGraphChange,
}: {
  fields: ModalField[];
  graph: import("../component-v2/types").ActionGraphDocument;
  serverId?: string;
  onGraphChange: (graph: import("../component-v2/types").ActionGraphDocument) => void;
}) {
  function getActionsForField(fieldId: string): FlowAction[] {
    // Find the field node for this field
    const fieldNode = graph.nodes.find(
      (n) => n.kind === "modal_field" && (n as any).fieldId === fieldId
    );
    if (!fieldNode) return [];

    // Find all edges from this field node
    const outgoingEdges = graph.edges.filter((e) => e.source === fieldNode.id);

    // Collect actions in order
    const actions: FlowAction[] = [];
    let currentId: string | undefined = fieldNode.id;

    while (currentId) {
      const edge = outgoingEdges.find((e) => e.source === currentId && e.kind === "next");
      if (!edge) break;

      const targetNode = graph.nodes.find((n) => n.id === edge.target);
      if (!targetNode || targetNode.kind !== "action") break;

      actions.push((targetNode as any).action);
      currentId = targetNode.id;
    }

    return actions;
  }

  function handleAddAction(fieldId: string, action: FlowAction) {
    // Find the field node
    const fieldNode = graph.nodes.find(
      (n) => n.kind === "modal_field" && (n as any).fieldId === fieldId
    );
    if (!fieldNode) return;

    // Create a new action node
    const actionNode = {
      id: uid(),
      kind: "action" as const,
      action,
      position: { x: 300, y: fieldNode.position?.y ?? 50 },
    };

    // Find the last action in the chain for this field
    const fieldActions = getActionsForField(fieldId);
    let lastNodeId = fieldNode.id;
    if (fieldActions.length > 0) {
      const lastActionNode = graph.nodes.find(
        (n) => n.kind === "action" && (n as any).action?.id === fieldActions[fieldActions.length - 1].id
      );
      if (lastActionNode) {
        lastNodeId = lastActionNode.id;
      }
    }

    // Create edge from last node to new action
    const newEdge = {
      id: uid(),
      source: lastNodeId,
      target: actionNode.id,
      kind: "next" as const,
    };

    onGraphChange({
      ...graph,
      nodes: [...graph.nodes, actionNode],
      edges: [...graph.edges, newEdge],
    });
  }

  function handleEditAction(actionId: string, updated: FlowAction) {
    onGraphChange({
      ...graph,
      nodes: graph.nodes.map((n) => {
        if (n.kind === "action" && (n as any).action?.id === actionId) {
          return { ...n, action: updated };
        }
        return n;
      }),
    });
  }

  function handleRemoveAction(actionId: string) {
    onGraphChange({
      ...graph,
      nodes: graph.nodes.filter((n) => !(n.kind === "action" && (n as any).action?.id === actionId)),
      edges: graph.edges.filter(
        (e) =>
          !(e.target === actionId) &&
          !(graph.nodes.find((n) => n.id === e.source && (n as any).action?.id === actionId))
      ),
    });
  }

  function handleDuplicateAction(actionId: string) {
    const actionNode = graph.nodes.find(
      (n) => n.kind === "action" && (n as any).action?.id === actionId
    );
    if (!actionNode) return;

    const action = (actionNode as any).action;
    const newAction = { ...action, id: uid() };

    // Find edge going into the original action
    const incomingEdge = graph.edges.find((e) => e.target === actionId);
    if (!incomingEdge) return;

    // Find edge going out of the original action
    const outgoingEdge = graph.edges.find((e) => e.source === actionId);

    // Create new action node
    const newActionNode = {
      id: uid(),
      kind: "action" as const,
      action: newAction,
      position: { x: actionNode.position?.x ?? 300, y: (actionNode.position?.y ?? 50) + 80 },
    };

    // Create edge from incoming source to new action
    const newIncomingEdge = {
      id: uid(),
      source: newActionNode.id,
      target: actionId,
      kind: incomingEdge.kind,
    };

    const newEdges = [...graph.edges, newIncomingEdge];
    if (outgoingEdge) {
      newEdges.push({
        id: uid(),
        source: newActionNode.id,
        target: outgoingEdge.target,
        kind: outgoingEdge.kind,
      });
    }

    onGraphChange({
      ...graph,
      nodes: [...graph.nodes, newActionNode],
      edges: newEdges,
    });
  }

  function handleMoveAction(fieldId: string, actionId: string, direction: "up" | "down") {
    // Get all actions for this field
    const fieldActions = getActionsForField(fieldId);
    const currentIndex = fieldActions.findIndex((a) => a.id === actionId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= fieldActions.length) return;

    // This is complex - would need to rewire edges
    // For now, we'll just swap positions in the node array
    const actionNodes = graph.nodes.filter((n) => n.kind === "action");
    const reordered = [...actionNodes];
    [reordered[currentIndex], reordered[targetIndex]] = [reordered[targetIndex], reordered[currentIndex]];

    // This is a simplified implementation
    // A full implementation would need to properly rewire edges
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 p-4">
        {fields.map((field) => (
          <FieldActionCard
            key={field.id}
            field={field}
            actions={getActionsForField(field.id)}
            serverId={serverId}
            onAddAction={(action) => handleAddAction(field.id, action)}
            onEditAction={(id, updated) => handleEditAction(id, updated)}
            onRemoveAction={(id) => handleRemoveAction(id)}
            onMoveAction={(id, dir) => handleMoveAction(field.id, id, dir)}
            onDuplicateAction={(id) => handleDuplicateAction(id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}