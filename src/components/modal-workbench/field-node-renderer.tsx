"use client";

import { cn } from "@/lib/utils";
import {
  Type,
  List,
  CheckSquare,
  FileText,
  Users,
  CircleDot,
  GripVertical,
} from "lucide-react";
import type { ActionGraphModalFieldNode, ModalComponentType } from "../component-v2/types";

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

// Field type colors
const fieldColors: Record<ModalComponentType, string> = {
  "short-answer": "#5865F2", // Blurple
  paragraph: "#5865F2",
  "multiple-choice": "#EB459E", // Pink
  checkboxes: "#57F287", // Green
  dropdown: "#FEE75C", // Yellow
  "text-display": "#9B59B6", // Purple
  "file-upload": "#E74C3C", // Red
  "single-checkbox": "#57F287",
  "user-select": "#3498DB", // Blue
  "role-select": "#E91E63", // Pink
  "channel-select": "#00BCD4", // Cyan
  "user-role-select": "#FF9800", // Orange
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

interface FieldNodeProps {
  node: ActionGraphModalFieldNode;
  isSelected?: boolean;
  onSelect?: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
}

/**
 * FieldNode renders a modal field as a node in the visual editor.
 * Field nodes have a teal/orange color scheme to distinguish them from action nodes (blue) and condition nodes (purple).
 */
export function FieldNode({ node, isSelected, onSelect, onDragStart }: FieldNodeProps) {
  const color = fieldColors[node.fieldType] || "#5865F2";
  const icon = fieldIcons[node.fieldType] || <Type className="w-4 h-4" />;
  const label = fieldLabels[node.fieldType] || node.fieldType;

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 bg-[#2b2d31] shadow-lg min-w-[200px] cursor-pointer",
        "transition-shadow duration-200",
        isSelected && "ring-2 ring-white ring-offset-2 ring-offset-[#1e1f22]"
      )}
      style={{ borderColor: color }}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <div
        className="absolute -left-6 top-1/2 -translate-y-1/2 w-5 h-8 flex items-center justify-center cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={onDragStart}
      >
        <GripVertical className="w-4 h-4 text-[#b5bac1]" />
      </div>

      {/* Input Port (top) */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#1e1f22] border-2 cursor-pointer hover:scale-125 transition-transform"
        style={{ borderColor: color }}
        title="Input"
      />

      {/* Header */}
      <div
        className="px-3 py-2 border-b border-[#3f4147] flex items-center gap-2"
        style={{ backgroundColor: `${color}20` }}
      >
        <div className="text-white">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">
            {node.fieldLabel}
          </div>
          <div className="text-xs text-[#b5bac1]">{label}</div>
        </div>
        {node.isRequired && (
          <div className="px-1.5 py-0.5 rounded bg-[#5865F2] text-[10px] text-white">
            Required
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        <div className="text-xs text-[#b5bac1]">
          Attach actions to this field
        </div>
      </div>

      {/* Output Port (bottom) */}
      <div
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#1e1f22] border-2 cursor-pointer hover:scale-125 transition-transform"
        style={{ borderColor: color }}
        title="Output"
      />
    </div>
  );
}

/**
 * Renders a field node within the canvas.
 * Used by VisualActionEditor to display modal field nodes.
 */
export function renderFieldNode(
  node: ActionGraphModalFieldNode,
  isSelected: boolean,
  onSelect: () => void
): React.ReactNode {
  return (
    <FieldNode
      node={node}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  );
}

/**
 * Get the icon for a field type.
 */
export function getFieldIcon(fieldType: ModalComponentType): React.ReactNode {
  return fieldIcons[fieldType] || <Type className="w-4 h-4" />;
}

/**
 * Get the color for a field type.
 */
export function getFieldColor(fieldType: ModalComponentType): string {
  return fieldColors[fieldType] || "#5865F2";
}

/**
 * Get the label for a field type.
 */
export function getFieldLabel(fieldType: ModalComponentType): string {
  return fieldLabels[fieldType] || fieldType;
}