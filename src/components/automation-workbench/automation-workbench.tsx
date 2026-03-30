"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Clock,
  Zap,
  UserPlus,
  UserMinus,
  MessageSquare,
  CircleDot,
  Headphones,
  ShieldPlus,
  ShieldMinus,
  CalendarDays,
  AlertCircle,
  MousePointer2,
  GitBranch,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  PanelLeft,
  Play,
  Plus,
  Settings,
  Shield,
  Trash2,
  Webhook,
  Mail,
  Users,
  Hash,
  X,
  Check,
  Ban,
  Unlock,
  Pencil,
  UserCog,
  UserX,
  UserCheck,
  Link,
  Unlink,
  Pin,
  List,
  LayoutGrid,
  Sticker,
  Smile,
  ArrowRight,
  MicOff,
  Server,
  MessagesSquare,
} from "lucide-react";
import {
  useCreateScheduledSequence,
} from "@/hooks/use-scheduled-sequences";
import type { EventFilter, ActionGraphDocument, ActionGraphNode, FlowAction, FlowActionType } from "@/components/component-v2/types";
import { EventFilterBuilder } from "./event-filter-builder";
import { CronPreview } from "./cron-preview";
import { ensureActionGraph, actionGraphToLegacyFlow, legacyFlowToGraph, isLinearizableGraph } from "@/components/component-v2/action-graph";
import { makeAction, actionLabel } from "@/components/component-v2/flow-editor";
import { ActionFields } from "@/components/component-v2/action-fields";
import { VisualActionEditor } from "@/components/component-v2/visual-action-editor";
import { ElementSidebar } from "@/components/elements/element-sidebar";
import { ElementInsertionProvider } from "@/components/elements/element-insertion-provider";
import type { ScheduledSequence } from "@/types/platform-extensions";
import {
  DISCORD_EVENTS,
  getEventByValue,
  getEventsByCategory,
  getEventCategories,
  getElementsForEvent,
  COMMON_ELEMENTS,
  type DiscordEventConfig,
  type EventElement,
} from "@/lib/discord-events";
import {
  ALL_ACTIONS,
  ACTION_CATEGORIES,
  getActionsForAutomation,
  getActionByType,
} from "@/components/shared/action-definitions";

// ── Types ─────────────────────────────────────────────────────────────────────

type TriggerType = "TIME" | "EVENT";

// Icon mapping for event categories
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  member: Users,
  message: MessageSquare,
  voice: Headphones,
  role: Shield,
  channel: Hash,
  thread: MessagesSquare,
  emoji: Smile,
  guild: Server,
};

// Icon mapping for events
const EVENT_ICONS: Record<string, React.ElementType> = {
  MEMBER_JOIN: UserPlus,
  MEMBER_LEAVE: UserMinus,
  MEMBER_KICK: UserX,
  MEMBER_BAN: Ban,
  MEMBER_UNBAN: Unlock,
  MEMBER_UPDATE: UserCog,
  MESSAGE_CREATE: MessageSquare,
  MESSAGE_EDIT: Pencil,
  MESSAGE_DELETE: Trash2,
  MESSAGE_REACTION_ADD: CircleDot,
  MESSAGE_REACTION_REMOVE: X,
  MESSAGE_REACTION_REMOVE_ALL: X,
  VOICE_JOIN: Headphones,
  VOICE_LEAVE: Headphones,
  VOICE_MOVE: ArrowRight,
  VOICE_MUTE: MicOff,
  ROLE_CREATE: ShieldPlus,
  ROLE_DELETE: ShieldMinus,
  ROLE_UPDATE: Shield,
  MEMBER_ROLE_ADD: UserCheck,
  MEMBER_ROLE_REMOVE: UserX,
  CHANNEL_CREATE: Plus,
  CHANNEL_DELETE: Trash2,
  CHANNEL_UPDATE: Settings,
  CHANNEL_PINNED_MESSAGE: Pin,
  THREAD_CREATE: MessagesSquare,
  THREAD_DELETE: Trash2,
  THREAD_UPDATE: Settings,
  SLASH_COMMAND: Hash,
  BUTTON_CLICK: MousePointer2,
  SELECT_MENU: List,
  MODAL_SUBMIT: LayoutGrid,
  EMOJI_CREATE: Smile,
  EMOJI_DELETE: Trash2,
  STICKER_CREATE: Sticker,
  STICKER_DELETE: Trash2,
  INVITE_CREATE: Link,
  INVITE_DELETE: Unlink,
  GUILD_UPDATE: Settings,
  GUILD_BAN_ADD: Ban,
  GUILD_BAN_REMOVE: Unlock,
};

const TIME_PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Daily at midnight", value: "0 0 * * *" },
  { label: "Daily at 9 AM", value: "0 9 * * *" },
  { label: "Weekly Monday 9 AM", value: "0 9 * * 1" },
  { label: "Monthly 1st", value: "0 0 1 * *" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

// Get automation-specific actions
const AUTOMATION_ACTIONS = getActionsForAutomation();

function uid() {
  return crypto.randomUUID();
}

// ── Action Card (Linear Mode) ─────────────────────────────────────────────────

function ActionCardLinear({
  action,
  isSelected,
  onSelect,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  isFirst,
  isLast,
  serverId,
}: {
  action: FlowAction;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updated: FlowAction) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  serverId?: string;
}) {
  const actionDef = AUTOMATION_ACTIONS.find(a => a.type === action.type);
  const Icon = actionDef?.icon || Settings;
  const color = actionDef?.color || "#6b7280";

  return (
    <div
      onClick={onSelect}
      className={cn(
        "rounded-[4px] border p-3 cursor-pointer transition-all",
        isSelected
          ? "border-[#5865F2] bg-[#5865F2]/10"
          : "border-[#3C3F45] bg-[#2B2D31] hover:border-[#5865F2]/40"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color }} />
          </div>
          <span className="text-sm font-medium text-white">
            {actionLabel(action)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onMoveUp && !isFirst && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              className="h-6 w-6 p-0 text-[#80848E] hover:text-white hover:bg-[#3C3F45]"
            >
              ↑
            </Button>
          )}
          {onMoveDown && !isLast && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              className="h-6 w-6 p-0 text-[#80848E] hover:text-white hover:bg-[#3C3F45]"
            >
              ↓
            </Button>
          )}
          {onDuplicate && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
              className="h-6 w-6 p-0 text-[#80848E] hover:text-white hover:bg-[#3C3F45]"
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="h-6 w-6 p-0 text-[#80848E] hover:text-[#F23F42] hover:bg-transparent"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      {isSelected && (
        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
          <ActionFields
            action={action}
            onChange={onChange}
            serverId={serverId}
          />
        </div>
      )}
    </div>
  );
}

// ── Action Palette Dropdown ────────────────────────────────────────────────────

function ActionPalette({ onAdd }: { onAdd: (type: FlowActionType) => void }) {
  const [open, setOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("messaging");

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[4px] border border-dashed border-[#3C3F45] bg-[#2B2D31]/50 text-[#B5BAC1] hover:text-white hover:border-[#5865F2]/40 hover:bg-[#2B2D31] transition-colors text-sm"
      >
        <Plus className="h-4 w-4" />
        Add Action
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-[#2B2D31] border border-[#3C3F45] rounded-[4px] shadow-lg overflow-hidden w-[400px]">
            <ScrollArea className="max-h-[400px]">
              <div className="p-2">
                {ACTION_CATEGORIES.map((category) => {
                  const categoryActions = AUTOMATION_ACTIONS.filter(a => a.category === category.id);
                  const CategoryIcon = category.icon;
                  const isExpanded = expandedCategory === category.id;

                  return (
                    <div key={category.id} className="mb-1">
                      <button
                        type="button"
                        onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-[3px] text-left hover:bg-[#3C3F45] transition-colors"
                      >
                        <ChevronRight className={cn("h-3 w-3 text-[#80848E] transition-transform", isExpanded && "rotate-90")} />
                        <CategoryIcon className="h-4 w-4 text-[#7289DA]" />
                        <span className="text-sm font-medium text-white">{category.label}</span>
                        <span className="text-xs text-[#80848E] ml-auto">{categoryActions.length}</span>
                      </button>
                      {isExpanded && (
                        <div className="ml-6 mt-1 space-y-0.5">
                          {categoryActions.map((action) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={action.type}
                                type="button"
                                onClick={() => {
                                  onAdd(action.type as FlowActionType);
                                  setOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-[3px] text-left hover:bg-[#3C3F45] transition-colors"
                              >
                                <div
                                  className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: `${action.color}20` }}
                                >
                                  <Icon className="h-3.5 w-3.5" style={{ color: action.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white">{action.label}</p>
                                  <p className="text-xs text-[#80848E] truncate">{action.description}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}

// ── Automation Workbench ─────────────────────────────────────────────────────

interface AutomationWorkbenchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serverId: string;
  editingSequence?: ScheduledSequence | null;
}

export function AutomationWorkbench({
  open,
  onOpenChange,
  serverId,
  editingSequence,
}: AutomationWorkbenchProps) {
  // Trigger state
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType>("TIME");
  const [eventType, setEventType] = useState("");
  const [cronExpression, setCronExpression] = useState("0 9 * * *");
  const [timezone, setTimezone] = useState("UTC");
  const [filters, setFilters] = useState<EventFilter[]>([]);

  // Editor state
  const [mode, setMode] = useState<"linear" | "node">("linear");
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [leftPanelTab, setLeftPanelTab] = useState<"trigger" | "elements">("trigger");
  const [draftGraph, setDraftGraph] = useState<ActionGraphDocument>(() => createDefaultGraph());

  const create = useCreateScheduledSequence(serverId);

  // Create default graph with trigger node
  function createDefaultGraph(): ActionGraphDocument {
    const triggerNode: ActionGraphNode = {
      id: "trigger-1",
      kind: "trigger",
      triggerType: "TIME",
      position: { x: 100, y: 50 },
    };

    return {
      version: 1,
      entry_node_id: "trigger-1",
      nodes: [triggerNode],
      edges: [],
    };
  }

  // Populate form when editing
  useEffect(() => {
    if (editingSequence) {
      setName(editingSequence.name || "");
      setTriggerType(editingSequence.trigger_type as TriggerType || "TIME");
      setEventType(editingSequence.event_type || "");
      setCronExpression(editingSequence.cron_expression || "0 9 * * *");
      setTimezone(editingSequence.timezone || "UTC");
      // TODO: Load action_graph if present
    }
  }, [editingSequence]);

  // Reset state on close
  const reset = useCallback(() => {
    setName("");
    setTriggerType("TIME");
    setEventType("");
    setCronExpression("0 9 * * *");
    setTimezone("UTC");
    setFilters([]);
    setSelectedNodeId(undefined);
    setDraftGraph(createDefaultGraph());
    setMode("linear");
  }, []);

  // Compute linear actions for linear mode
  const linearActions = useMemo(() => {
    // Filter out trigger node, only return action nodes
    const flow = actionGraphToLegacyFlow(draftGraph);
    return flow;
  }, [draftGraph]);

  // Check if graph is linearizable
  const canUseLinear = useMemo(() => isLinearizableGraph(draftGraph), [draftGraph]);

  // Update trigger node when trigger type changes
  useEffect(() => {
    setDraftGraph((current) => {
      const triggerNode = current.nodes.find((n) => n.kind === "trigger");
      if (!triggerNode) return current;
      return {
        ...current,
        nodes: current.nodes.map((n) =>
          n.id === triggerNode.id
            ? {
                ...n,
                kind: "trigger",
                triggerType,
                eventType: triggerType === "EVENT" ? eventType : undefined,
                cronExpression: triggerType === "TIME" ? cronExpression : undefined,
                filters: triggerType === "EVENT" ? filters : undefined,
              }
            : n
        ),
      };
    });
  }, [triggerType, eventType, cronExpression, filters]);

  function updateLinearAction(index: number, next: FlowAction) {
    const actionNodes = draftGraph.nodes.filter(n => n.kind === "action");
    const node = actionNodes[index];
    if (!node) return;

    setDraftGraph((current) => ({
      ...current,
      nodes: current.nodes.map((n) =>
        n.id === node.id ? { ...n, action: next } : n
      ),
    }));
  }

  function deleteLinearAction(index: number) {
    const actionNodes = draftGraph.nodes.filter(n => n.kind === "action");
    const node = actionNodes[index];
    if (!node) return;

    setDraftGraph((current) => ({
      ...current,
      nodes: current.nodes.filter((n) => n.id !== node.id),
      edges: current.edges.filter((e) => e.source !== node.id && e.target !== node.id),
    }));
    setSelectedNodeId(undefined);
  }

  function moveLinearAction(index: number, direction: -1 | 1) {
    const actionNodes = draftGraph.nodes.filter(n => n.kind === "action");
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= actionNodes.length) return;

    // Swap positions
    const node1 = actionNodes[index];
    const node2 = actionNodes[targetIndex];

    setDraftGraph((current) => ({
      ...current,
      nodes: current.nodes.map((n) => {
        if (n.id === node1.id) return { ...n, position: node2.position };
        if (n.id === node2.id) return { ...n, position: node1.position };
        return n;
      }),
    }));
  }

  function duplicateLinearAction(index: number) {
    const actionNodes = draftGraph.nodes.filter(n => n.kind === "action");
    const node = actionNodes[index];
    if (!node || node.kind !== "action") return;

    const nodePos = node.position ?? { x: 100, y: 200 };
    const newNode: ActionGraphNode = {
      id: uid(),
      kind: "action",
      action: { ...node.action, id: uid() },
      position: { x: nodePos.x, y: nodePos.y + 150 },
    };

    setDraftGraph((current) => ({
      ...current,
      nodes: [...current.nodes, newNode],
    }));
  }

  function addAction(actionType: FlowActionType) {
    const existingActions = draftGraph.nodes.filter(n => n.kind === "action");
    const lastAction = existingActions[existingActions.length - 1];
    const triggerNode = draftGraph.nodes.find(n => n.kind === "trigger");

    const lastActionPos = lastAction?.position ?? { x: 100, y: 200 };
    const triggerPos = triggerNode?.position ?? { x: 100, y: 50 };

    const newY = lastAction
      ? lastActionPos.y + 150
      : triggerPos.y + 150;

    const newNode: ActionGraphNode = {
      id: uid(),
      kind: "action",
      action: makeAction(actionType),
      position: { x: 100, y: newY },
    };

    // Create edge from last node to new node
    const lastNodeId = lastAction?.id ?? triggerNode?.id;
    const newEdge = lastNodeId ? {
      id: uid(),
      source: lastNodeId,
      target: newNode.id,
      kind: "next" as const,
    } : null;

    setDraftGraph((current) => ({
      ...current,
      nodes: [...current.nodes, newNode],
      edges: newEdge ? [...current.edges, newEdge] : current.edges,
    }));
    setSelectedNodeId(newNode.id);
  }

  // Validation
  const isValid =
    name.trim() &&
    (triggerType === "TIME" ? cronExpression : eventType) &&
    draftGraph.nodes.some(n => n.kind === "action");

  async function handleSave() {
    if (!isValid) return;
    try {
      // Convert draftGraph to legacy flow for action_graph
      const flowActions = actionGraphToLegacyFlow(draftGraph);

      const payload = {
        name: name.trim(),
        trigger_type: triggerType,
        event_type: triggerType === "EVENT" ? eventType : undefined,
        cron_expression: triggerType === "TIME" ? cronExpression : undefined,
        timezone,
        action_graph: draftGraph,
        event_filters: triggerType === "EVENT" && filters.length > 0 ? filters : undefined,
      };
      await create.mutateAsync(payload as Parameters<typeof create.mutateAsync>[0]);
      reset();
      onOpenChange(false);
    } catch {
      // toast handled by hook
    }
  }

  function handleClose() {
    reset();
    onOpenChange(false);
  }

  // Get selected node for inspector
  const selectedNode = draftGraph.nodes.find((n) => n.id === selectedNodeId);

  const isEditing = !!editingSequence;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[98vw] h-[96vh] overflow-hidden p-0 flex flex-col">
        <DialogTitle className="sr-only">
          {isEditing ? "Edit Automation" : "New Automation"}
        </DialogTitle>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3C3F45] px-6 py-4 flex-shrink-0 bg-[#1E1F22]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#5865F2]/20 flex items-center justify-center">
              <Zap className="h-4 w-4 text-[#7289DA]" />
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Automation name…"
                className="w-full bg-transparent text-white text-base font-semibold placeholder-[#6D6F78] outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Mode Toggle */}
            <div className="flex bg-[#2B2D31] rounded-[4px] p-0.5 border border-[#3C3F45]">
              <button
                type="button"
                onClick={() => setMode("linear")}
                disabled={!canUseLinear}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-medium transition-all outline-none",
                  mode === "linear"
                    ? "bg-[#5865F2] text-white"
                    : canUseLinear
                      ? "text-[#B5BAC1] hover:text-white"
                      : "text-[#6D6F78] cursor-not-allowed"
                )}
              >
                <MousePointer2 className="h-3.5 w-3.5" />
                Linear
              </button>
              <button
                type="button"
                onClick={() => setMode("node")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-medium transition-all outline-none",
                  mode === "node"
                    ? "bg-[#5865F2] text-white"
                    : "text-[#B5BAC1] hover:text-white"
                )}
              >
                <GitBranch className="h-3.5 w-3.5" />
                Node
              </button>
            </div>
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-[#B5BAC1]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid || create.isPending}
              className="bg-[#5865F2] hover:bg-[#4752C4]"
            >
              {create.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>

        {/* Body: 3-column layout */}
        <div
          className="flex flex-1 min-h-0"
          style={{
            gridTemplateColumns: leftPanelOpen ? "280px 1fr 300px" : "48px 1fr 300px",
          }}
        >
          {/* Left Column: Trigger Panel + Elements Sidebar */}
          <div className="w-[280px] flex-shrink-0 border-r border-[#3C3F45] bg-[#2B2D31] flex flex-col overflow-hidden">
            {/* Panel Toggle */}
            <button
              onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              className="w-full h-10 flex items-center justify-center border-b border-[#3C3F45] hover:bg-[#3C3F45] transition-colors flex-shrink-0"
              title={leftPanelOpen ? "Hide panel" : "Show panel"}
            >
              <PanelLeft className={cn("w-5 h-5 text-[#B5BAC1]", !leftPanelOpen && "rotate-180")} />
            </button>

            {leftPanelOpen && (
              <>
                {/* Tab Toggle: Trigger / Elements */}
                <div className="flex gap-1 p-2 border-b border-[#3C3F45]">
                  <button
                    type="button"
                    onClick={() => setLeftPanelTab("trigger")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-[3px] text-sm font-medium transition-all outline-none",
                      leftPanelTab === "trigger"
                        ? "bg-[#5865F2] text-white"
                        : "text-[#B5BAC1] hover:text-white hover:bg-[#3C3F45]"
                    )}
                  >
                    {triggerType === "TIME" ? <Clock className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                    Trigger
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeftPanelTab("elements")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-[3px] text-sm font-medium transition-all outline-none",
                      leftPanelTab === "elements"
                        ? "bg-[#5865F2] text-white"
                        : "text-[#B5BAC1] hover:text-white hover:bg-[#3C3F45]"
                    )}
                  >
                    <Hash className="h-4 w-4" />
                    Elements
                  </button>
                </div>

                {/* Tab Content */}
                {leftPanelTab === "trigger" && (
                  <ScrollArea className="flex-1">
                    <div className="px-4 py-4">
                      {/* Trigger Type Toggle */}
                      <div className="flex gap-1 bg-[#1E1F22] rounded-[4px] p-1 mb-4">
                        {(["TIME", "EVENT"] as TriggerType[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setTriggerType(t)}
                            className={cn(
                              "flex-1 flex items-center justify-center gap-2 py-2 rounded-[3px] text-sm font-medium transition-all outline-none",
                              triggerType === t
                                ? "bg-[#5865F2] text-white"
                                : "text-[#B5BAC1] hover:text-white hover:bg-[#2B2D31]"
                            )}
                          >
                            {t === "TIME" ? <Clock className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                            {t === "TIME" ? "Time" : "Event"}
                          </button>
                        ))}
                      </div>

                      {/* TIME CONFIG */}
                      {triggerType === "TIME" && (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[#B5BAC1] uppercase tracking-wide">
                              Schedule Preset
                            </label>
                            <div className="space-y-1">
                              {TIME_PRESETS.map((p) => (
                                <button
                                  key={p.value}
                                  type="button"
                                  onClick={() => setCronExpression(p.value)}
                                  className={cn(
                                    "w-full flex items-center gap-2 px-3 py-2 rounded-[3px] text-sm text-left transition-all outline-none",
                                    cronExpression === p.value
                                      ? "bg-[#5865F2]/20 text-white border border-[#5865F2]/40"
                                      : "bg-[#1E1F22] text-[#B5BAC1] hover:text-white border border-transparent"
                                  )}
                                >
                                  <CalendarDays className="h-4 w-4 flex-shrink-0 text-[#7289DA]" />
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[#B5BAC1] uppercase tracking-wide">
                              Cron Expression
                            </label>
                            <input
                              type="text"
                              value={cronExpression}
                              onChange={(e) => setCronExpression(e.target.value)}
                              placeholder="0 9 * * *"
                              className="w-full bg-[#1E1F22] text-[#DBDEE1] border border-[#3C3F45] rounded-[3px] px-3 py-2 text-sm font-mono outline-none focus:border-[#5865F2] transition-colors"
                            />
                            <CronPreview expression={cronExpression} />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs font-medium text-[#B5BAC1] uppercase tracking-wide">
                              Timezone
                            </label>
                            <select
                              value={timezone}
                              onChange={(e) => setTimezone(e.target.value)}
                              className="w-full bg-[#1E1F22] text-[#DBDEE1] border border-[#3C3F45] rounded-[3px] px-3 py-2 text-sm outline-none focus:border-[#5865F2] transition-colors"
                            >
                              {TIMEZONES.map((tz) => (
                                <option key={tz.value} value={tz.value}>{tz.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* EVENT CONFIG */}
                      {triggerType === "EVENT" && (
                        <div className="space-y-4">
                          {/* Event Selector */}
                          <div className="space-y-2">
                            <label className="text-xs font-medium text-[#B5BAC1] uppercase tracking-wide">
                              Discord Event
                            </label>
                            <div className="space-y-1">
                              {getEventCategories().map((category) => {
                                const categoryEvents = getEventsByCategory(category.value);
                                const CategoryIcon = CATEGORY_ICONS[category.value] || Zap;
                                return (
                                  <details
                                    key={category.value}
                                    className="group"
                                    open={categoryEvents.some(e => e.value === eventType)}
                                  >
                                    <summary className="flex items-center gap-2 px-2 py-1.5 rounded-[3px] bg-[#1E1F22] cursor-pointer hover:bg-[#2B2D31] transition-colors list-none">
                                      <ChevronRight className="h-3 w-3 text-[#80848E] group-open:rotate-90 transition-transform" />
                                      <CategoryIcon className="h-4 w-4 text-[#7289DA]" />
                                      <span className="text-sm font-medium text-white">{category.label}</span>
                                      <span className="text-xs text-[#80848E] ml-auto">{categoryEvents.length}</span>
                                    </summary>
                                    <div className="grid grid-cols-1 gap-1 mt-1 pl-6">
                                      {categoryEvents.map((event) => {
                                        const EventIcon = EVENT_ICONS[event.value] || Zap;
                                        const isSelected = eventType === event.value;
                                        return (
                                          <button
                                            key={event.value}
                                            type="button"
                                            onClick={() => setEventType(event.value)}
                                            className={cn(
                                              "flex items-center gap-2 px-2 py-1.5 rounded-[3px] text-xs text-left transition-all outline-none",
                                              isSelected
                                                ? "bg-[#5865F2] text-white"
                                                : "bg-[#1E1F22] text-[#DBDEE1] hover:bg-[#2B2D31]"
                                            )}
                                            title={event.description}
                                          >
                                            <EventIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span className="truncate">{event.label}</span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </details>
                                );
                              })}
                            </div>
                          </div>

                          {eventType && (
                            <>
                              {/* Event Description */}
                              <div className="p-2 rounded-[3px] bg-[#5865F2]/10 border border-[#5865F2]/30">
                                <p className="text-xs text-[#B5BAC1]">
                                  {getEventByValue(eventType)?.description}
                                </p>
                              </div>

                              {/* Event Filters */}
                              <div className="pt-2 border-t border-[#3C3F45]">
                                <EventFilterBuilder
                                  eventType={eventType}
                                  filters={filters}
                                  onChange={setFilters}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}

                {leftPanelTab === "elements" && (
                  <div className="flex-1 overflow-hidden">
                    <ElementInsertionProvider>
                      <ElementSidebar
                        serverId={serverId}
                        className="h-full bg-[#2B2D31] border-0"
                      />
                    </ElementInsertionProvider>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Center: Action Canvas */}
          <div className="flex-1 min-h-0 bg-[#1E1F22] flex flex-col overflow-hidden">
            {mode === "linear" ? (
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-3">
                  {/* Trigger Indicator */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#3C3F45]">
                    <div className={cn(
                      "w-8 h-8 rounded flex items-center justify-center",
                      triggerType === "TIME" ? "bg-[#f59e0b]/20" : "bg-[#5865F2]/20"
                    )}>
                      {triggerType === "TIME" ? (
                        <Clock className="h-4 w-4 text-[#f59e0b]" />
                      ) : (
                        <Zap className="h-4 w-4 text-[#5865F2]" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {triggerType === "TIME" ? "Time Trigger" : `Event: ${DISCORD_EVENTS.find(e => e.value === eventType)?.label || "Select event"}`}
                      </p>
                      <p className="text-xs text-[#80848E]">
                        {triggerType === "TIME"
                          ? cronExpression
                          : "Triggers when this event occurs"}
                      </p>
                    </div>
                  </div>

                  {/* Actions List */}
                  {linearActions?.map((action, index) => (
                    <ActionCardLinear
                      key={action.id}
                      action={action}
                      isSelected={selectedNodeId === draftGraph.nodes.find(n => n.kind === "action" && n.action?.id === action.id)?.id}
                      onSelect={() => {
                        const node = draftGraph.nodes.find(n => n.kind === "action" && n.action?.id === action.id);
                        if (node) setSelectedNodeId(node.id);
                      }}
                      onChange={(next) => updateLinearAction(index, next)}
                      onDelete={() => deleteLinearAction(index)}
                      onMoveUp={() => moveLinearAction(index, -1)}
                      onMoveDown={() => moveLinearAction(index, 1)}
                      onDuplicate={() => duplicateLinearAction(index)}
                      isFirst={index === 0}
                      isLast={index === (linearActions?.length ?? 0) - 1}
                      serverId={serverId}
                    />
                  ))}

                  {/* Add Action Button */}
                  <ActionPalette onAdd={addAction} />
                </div>
              </ScrollArea>
            ) : (
              <VisualActionEditor
                graph={draftGraph}
                onChange={setDraftGraph}
                serverId={serverId}
              />
            )}
          </div>

          {/* Right: Inspector - only shown when a node is selected */}
          {selectedNode && (
            <div className="w-[360px] flex-shrink-0 bg-[#232428] border-l border-[#3C3F45] overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4">
                  {selectedNode.kind === "action" ? (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const actionDef = AUTOMATION_ACTIONS.find(a => a.type === selectedNode.action?.type);
                            const Icon = actionDef?.icon || Settings;
                            const color = actionDef?.color || "#6b7280";
                            return (
                              <div
                                className="w-6 h-6 rounded flex items-center justify-center"
                                style={{ backgroundColor: `${color}20` }}
                              >
                                <Icon className="h-3.5 w-3.5" style={{ color }} />
                              </div>
                            );
                          })()}
                          <h3 className="text-sm font-semibold text-white">
                            {selectedNode.action ? actionLabel(selectedNode.action) : "Action"}
                          </h3>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDraftGraph((current) => ({
                              ...current,
                              nodes: current.nodes.filter((n) => n.id !== selectedNode.id),
                              edges: current.edges.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id),
                            }));
                            setSelectedNodeId(undefined);
                          }}
                          className="h-6 w-6 p-0 text-[#80848E] hover:text-[#F23F42] hover:bg-transparent"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="border border-[#3C3F45] rounded-[4px] p-3 bg-[#1E1F22]">
                        <ActionFields
                          action={selectedNode.action}
                          onChange={(next) => setDraftGraph((current) => ({
                            ...current,
                            nodes: current.nodes.map((n) =>
                              n.id === selectedNode.id ? { ...n, action: next } : n
                            ),
                          }))}
                          serverId={serverId}
                        />
                      </div>
                    </>
                  ) : selectedNode.kind === "trigger" ? (
                    <div className="text-center py-4">
                      <div className={cn(
                        "w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center",
                        triggerType === "TIME" ? "bg-[#f59e0b]/20" : "bg-[#5865F2]/20"
                      )}>
                        {triggerType === "TIME" ? (
                          <Clock className="h-6 w-6 text-[#f59e0b]" />
                        ) : (
                          <Zap className="h-6 w-6 text-[#5865F2]" />
                        )}
                      </div>
                      <p className="text-sm font-medium text-white mb-1">Trigger Node</p>
                      <p className="text-xs text-[#80848E]">
                        Configure the trigger in the left panel
                      </p>
                    </div>
                  ) : null}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { MiniFlowViz } from "./mini-flow-viz";