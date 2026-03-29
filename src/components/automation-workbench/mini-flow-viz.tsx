"use client";

import { cn } from "@/lib/utils";
import type { ActionGraphDocument, FlowAction } from "@/components/component-v2/types";
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
  Play,
  Check,
  Hourglass,
  Send,
  MessageCircle,
  FileText,
  Ban,
  Timer,
  GitBranch,
} from "lucide-react";

// ── Event Type Icons ────────────────────────────────────────────────────────

const EVENT_ICONS: Record<string, typeof UserPlus> = {
  MEMBER_JOIN: UserPlus,
  MEMBER_LEAVE: UserMinus,
  MESSAGE_SENT: MessageSquare,
  MESSAGE_REACTION_ADD: CircleDot,
  VOICE_JOIN: Headphones,
  VOICE_LEAVE: Headphones,
  ROLE_ASSIGNED: ShieldPlus,
  ROLE_REMOVED: ShieldMinus,
};

const EVENT_LABELS: Record<string, string> = {
  MEMBER_JOIN: "Member Join",
  MEMBER_LEAVE: "Member Leave",
  MESSAGE_SENT: "Message",
  MESSAGE_REACTION_ADD: "Reaction",
  VOICE_JOIN: "Voice Join",
  VOICE_LEAVE: "Voice Leave",
  ROLE_ASSIGNED: "Role Added",
  ROLE_REMOVED: "Role Removed",
};

// ── Action Icons ────────────────────────────────────────────────────────────

function getActionIcon(action: FlowAction): typeof Play {
  switch (action.type) {
    case "wait":
      return Hourglass;
    case "check":
      return GitBranch;
    case "add_role":
      return ShieldPlus;
    case "remove_role":
      return ShieldMinus;
    case "toggle_role":
      return ShieldPlus;
    case "send_output":
    case "send_to_channel":
    case "dm_user":
      return Send;
    case "log_to_channel":
      return FileText;
    case "create_thread":
      return MessageCircle;
    case "set_variable":
      return Play;
    case "delete_message":
      return Ban;
    case "cooldown":
      return Timer;
    case "stop":
      return Ban;
    default:
      return Play;
  }
}

function getActionLabel(action: FlowAction): string {
  switch (action.type) {
    case "wait":
      return `${action.duration}${action.unit === "seconds" ? "s" : action.unit === "minutes" ? "m" : action.unit === "hours" ? "h" : "d"}`;
    case "check":
      return "Check";
    case "add_role":
      return action.roleIds.length > 0 ? `+${action.roleIds.length} roles` : "+Role";
    case "remove_role":
      return action.roleIds.length > 0 ? `-${action.roleIds.length} roles` : "-Role";
    case "toggle_role":
      return "Toggle";
    case "send_output":
      return "Send";
    case "send_to_channel":
      return "To Channel";
    case "dm_user":
      return "DM";
    case "log_to_channel":
      return "Log";
    case "create_thread":
      return "Thread";
    case "set_variable":
      return "Set";
    case "delete_message":
      return "Delete";
    case "cooldown":
      return `${action.duration}${action.unit === "seconds" ? "s" : action.unit === "minutes" ? "m" : "h"}`;
    case "stop":
      return "Stop";
    default:
      return "Action";
  }
}

// ── Mini Flow Viz ────────────────────────────────────────────────────────────

export interface MiniFlowVizProps {
  /** The action graph to visualize */
  graph?: ActionGraphDocument;
  /** Trigger type: TIME or EVENT */
  triggerType?: "TIME" | "EVENT";
  /** Event type for EVENT triggers */
  eventType?: string;
  /** Cron expression for TIME triggers */
  cronExpression?: string;
  /** Compact mode - shows fewer nodes */
  compact?: boolean;
  /** Max number of action nodes to show */
  maxNodes?: number;
  /** Additional class names */
  className?: string;
}

export function MiniFlowViz({
  graph,
  triggerType = "TIME",
  eventType,
  cronExpression,
  compact = false,
  maxNodes = 4,
  className,
}: MiniFlowVizProps) {
  // Get trigger icon and label
  const TriggerIcon = triggerType === "TIME" ? Clock : EVENT_ICONS[eventType || ""] || Zap;
  const triggerLabel = triggerType === "TIME"
    ? (cronExpression ? formatCron(cronExpression) : "Schedule")
    : (EVENT_LABELS[eventType || ""] || eventType || "Event");

  // Get action nodes from graph
  const actionNodes: FlowAction[] = [];
  if (graph?.nodes) {
    for (const node of graph.nodes) {
      if (node.kind === "action" && actionNodes.length < maxNodes) {
        actionNodes.push(node.action);
      }
    }
  }

  const totalActions = graph?.nodes?.filter(n => n.kind === "action").length || 0;
  const showMore = totalActions > maxNodes;
  const remaining = totalActions - maxNodes;

  if (compact) {
    // Compact mode: just show icon row
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div className="w-5 h-5 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center">
          <TriggerIcon className="h-3 w-3 text-[#7289DA]" />
        </div>
        {actionNodes.slice(0, 3).map((action, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#6D6F78]" />
            <div className="w-16 h-4 rounded bg-[#313338] border border-[#3C3F45]" />
          </div>
        ))}
        {showMore && (
          <span className="text-[10px] text-[#6D6F78]">+{remaining}</span>
        )}
      </div>
    );
  }

  // Full mode: show labels
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Trigger */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#5865F2]/20 border border-[#5865F2]/40">
        <TriggerIcon className="h-3.5 w-3.5 text-[#7289DA]" />
        <span className="text-xs text-white font-medium truncate max-w-[100px]">
          {triggerLabel}
        </span>
      </div>

      {/* Actions */}
      {actionNodes.map((action, i) => {
        const ActionIcon = getActionIcon(action);
        const label = getActionLabel(action);
        return (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#6D6F78]" />
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#313338] border border-[#3C3F45]">
              <ActionIcon className="h-3 w-3 text-[#B5BAC1]" />
              <span className="text-xs text-[#DBDEE1] truncate max-w-[80px]">{label}</span>
            </div>
          </div>
        );
      })}

      {/* Remaining count */}
      {showMore && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-[#6D6F78]" />
          <span className="text-xs text-[#80848E]">+{remaining} more</span>
        </div>
      )}

      {/* No actions placeholder */}
      {actionNodes.length === 0 && (
        <span className="text-xs text-[#6D6F78] italic">No actions configured</span>
      )}
    </div>
  );
}

// ── Cron Formatter ──────────────────────────────────────────────────────────

function formatCron(expression: string): string {
  if (!expression) return "Schedule";

  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return expression;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Common presets
  if (minute === "*" && hour === "*") return "Every minute";
  if (minute === "0" && hour === "*") return "Every hour";
  if (minute === "0" && hour === "0" && dayOfMonth === "*") return "Daily";
  if (minute === "0" && hour === "0" && dayOfMonth === "1") return "Monthly";

  // Weekly
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
    const dayNum = parseInt(dayOfWeek, 10);
    if (!isNaN(dayNum) && dayNum >= 0 && dayNum <= 6) {
      return `Every ${dayNames[dayNum]}`;
    }
  }

  // Daily at time
  if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
    const hourNum = parseInt(hour, 10);
    const minNum = parseInt(minute, 10);
    if (!isNaN(hourNum) && !isNaN(minNum)) {
      const h = hourNum % 12 || 12;
      const ampm = hourNum >= 12 ? "PM" : "AM";
      return minNum === 0 ? `Daily ${h}${ampm}` : `${h}:${minNum.toString().padStart(2, "0")} ${ampm}`;
    }
  }

  return expression;
}