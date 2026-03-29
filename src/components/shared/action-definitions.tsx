"use client";

import {
  MessageSquare,
  Mail,
  Pencil,
  Trash2,
  Pin,
  Shield,
  Ban,
  Clock,
  Check,
  X,
  Settings,
  GitBranch,
  Webhook,
  Hash,
  Database,
  Layers,
  CalendarClock,
  Reply,
  LogIn,
  Users,
  Headphones,
  UserX,
  LayoutGrid,
} from "lucide-react";

// ── Action Type Definition ─────────────────────────────────────────────────────

export type ActionCategory = "messaging" | "roles" | "moderation" | "flow" | "integration" | "threads" | "modal";

export interface ActionDefinition {
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  description: string;
  category: ActionCategory;
  availableInFlow?: boolean;
  availableInAutomation?: boolean;
  isDeprecated?: boolean;
}

// ── Consolidated Action List ─────────────────────────────────────────────────────

export const ALL_ACTIONS: ActionDefinition[] = [
  // ═════════════════════════════════════════════════════════════════════════════════
  // MESSAGING - All message operations consolidated into one action
  // Operations: send_output, edit_message, delete, pin, unpin, react
  // ═════════════════════════════════════════════════════════════════════════════════
  {
    type: "message_action",
    label: "Message Actions",
    icon: MessageSquare,
    color: "#5865F2",
    description: "Send, edit, delete, pin, react to messages",
    category: "messaging",
    availableInFlow: true,
    availableInAutomation: true,
  },

  // ═════════════════════════════════════════════════════════════════════════════════
  // THREADS - Thread management operations
  // Operations: create, archive, delete
  // ═════════════════════════════════════════════════════════════════════════════════
  {
    type: "thread_action",
    label: "Thread Actions",
    icon: GitBranch,
    color: "#5865F2",
    description: "Create, archive, or delete threads",
    category: "threads",
    availableInFlow: true,
    availableInAutomation: true,
  },

  // ═════════════════════════════════════════════════════════════════════════════════
  // MODAL - Modal interaction operations
  // Operations: show, close, update
  // ═════════════════════════════════════════════════════════════════════════════════
  {
    type: "modal_action",
    label: "Modal Actions",
    icon: LayoutGrid,
    color: "#9333ea",
    description: "Show, close, or update modals",
    category: "modal",
    availableInFlow: true,
    availableInAutomation: true,
  },

  // ═════════════════════════════════════════════════════════════════════════════════
  // ROLES - All role management operations
  // Operations: add, remove, toggle, add_temporary
  // ═════════════════════════════════════════════════════════════════════════════════
  {
    type: "role_action",
    label: "Role Actions",
    icon: Shield,
    color: "#10b981",
    description: "Add, remove, or toggle roles",
    category: "roles",
    availableInFlow: true,
    availableInAutomation: true,
  },

  // ═════════════════════════════════════════════════════════════════════════════════
  // NICKNAME - Nickname management operations
  // Operations: set_nickname, reset_nickname
  // ═════════════════════════════════════════════════════════════════════════════════
  {
    type: "nickname_action",
    label: "Nickname Actions",
    icon: Pencil,
    color: "#8b5cf6",
    description: "Set or reset user nickname",
    category: "roles",
    availableInFlow: true,
    availableInAutomation: true,
  },

  // ═════════════════════════════════════════════════════════════════════════════════
  // MODERATION - All user moderation operations
  // Operations: kick, ban, unban, timeout, remove_timeout, warn, clear_warnings, quarantine
  // ═════════════════════════════════════════════════════════════════════════════════
  {
    type: "moderation_action",
    label: "Moderation Actions",
    icon: Ban,
    color: "#ef4444",
    description: "Kick, ban, timeout, warn, or quarantine users",
    category: "moderation",
    availableInFlow: false,
    availableInAutomation: true,
  },

  // ═════════════════════════════════════════════════════════════════════════════════
  // VOICE - Voice channel operations
  // Operations: move, disconnect, mute, deafen, unmute, undeafen
  // ═════════════════════════════════════════════════════════════════════════════════
  {
    type: "voice_action",
    label: "Voice Actions",
    icon: Headphones,
    color: "#9B59B6",
    description: "Move, disconnect, mute, or deafen users in voice",
    category: "moderation",
    availableInFlow: false,
    availableInAutomation: true,
  },

  // ═════════════════════════════════════════════════════════════════════════════════
  // CHANNEL - Channel management operations
  // Operations: create, delete, edit, lock, unlock, slow_mode, clear_slow_mode, archive_thread
  // ═════════════════════════════════════════════════════════════════════════════════
  {
    type: "channel_action",
    label: "Channel Actions",
    icon: Hash,
    color: "#3b82f6",
    description: "Create, delete, edit, lock channels or set slow mode",
    category: "integration",
    availableInFlow: false,
    availableInAutomation: true,
  },

  // ═════════════════════════════════════════════════════════════════════════════════
  // DATA - Variable/data operations
  // Operations: increment, decrement, append, remove, set, random_number, random_choice
  // ═════════════════════════════════════════════════════════════════════════════════
  {
    type: "data_action",
    label: "Variable Actions",
    icon: Database,
    color: "#14b8a6",
    description: "Increment, decrement, append, or manipulate variables",
    category: "flow",
    availableInFlow: true,
    availableInAutomation: true,
  },

  // ═════════════════════════════════════════════════════════════════════════════════
  // FLOW CONTROL - Individual flow actions
  // ═════════════════════════════════════════════════════════════════════════════════
  {
    type: "do_nothing",
    label: "Do Nothing",
    icon: X,
    color: "#6b7280",
    description: "No action (placeholder)",
    category: "flow",
    availableInFlow: true,
    availableInAutomation: true,
  },
  {
    type: "check",
    label: "Check Condition",
    icon: Check,
    color: "#8b5cf6",
    description: "Branch based on a condition",
    category: "flow",
    availableInFlow: true,
    availableInAutomation: true,
  },
  {
    type: "stop",
    label: "Stop Flow",
    icon: X,
    color: "#ef4444",
    description: "Stop the execution",
    category: "flow",
    availableInFlow: true,
    availableInAutomation: true,
  },
  {
    type: "set_variable",
    label: "Set Variable",
    icon: Settings,
    color: "#14b8a6",
    description: "Store a value for later use",
    category: "flow",
    availableInFlow: true,
    availableInAutomation: true,
  },
  {
    type: "cooldown",
    label: "Cooldown/Wait",
    icon: Clock,
    color: "#f59e0b",
    description: "Set a cooldown period between uses",
    category: "flow",
    availableInFlow: true,
    availableInAutomation: true,
  },
  {
    type: "flow_control",
    label: "Flow Control",
    icon: Layers,
    color: "#8b5cf6",
    description: "Loops, parallel execution, try/catch, subflows",
    category: "flow",
    availableInFlow: true,
    availableInAutomation: true,
  },
  {
    type: "wait_until",
    label: "Wait Until",
    icon: CalendarClock,
    color: "#f59e0b",
    description: "Wait until a specific time or condition",
    category: "flow",
    availableInFlow: false,
    availableInAutomation: true,
  },
  {
    type: "random_branch",
    label: "Random Branch",
    icon: GitBranch,
    color: "#8b5cf6",
    description: "Randomly choose between branches",
    category: "flow",
    availableInFlow: false,
    availableInAutomation: true,
  },

  // ═════════════════════════════════════════════════════════════════════════════════
  // INTEGRATION - External integrations
  // ═════════════════════════════════════════════════════════════════════════════════
  {
    type: "webhook_call",
    label: "Webhook Call",
    icon: Webhook,
    color: "#06b6d4",
    description: "Call an external webhook URL",
    category: "integration",
    availableInFlow: true,
    availableInAutomation: true,
  },
  {
    type: "http_request",
    label: "HTTP Request",
    icon: Webhook,
    color: "#06b6d4",
    description: "Make an HTTP request to an external API",
    category: "integration",
    availableInFlow: false,
    availableInAutomation: true,
  },
  {
    type: "roblox_verify",
    label: "Roblox Verification",
    icon: Shield,
    color: "#00A2FF",
    description: "Require user to verify their Roblox account",
    category: "integration",
    availableInFlow: false,
    availableInAutomation: true,
  },
];

// ── Category Definitions ───────────────────────────────────────────────────────

export const ACTION_CATEGORIES = [
  { id: "messaging", label: "Messaging", icon: MessageSquare },
  { id: "threads", label: "Threads", icon: GitBranch },
  { id: "roles", label: "Roles", icon: Shield },
  { id: "moderation", label: "Moderation", icon: Ban },
  { id: "flow", label: "Flow Control", icon: Layers },
  { id: "integration", label: "Integration", icon: Webhook },
] as const;

// ── Helper Functions ──────────────────────────────────────────────────────────

export function getActionsForFlow(): ActionDefinition[] {
  return ALL_ACTIONS.filter(a => a.availableInFlow !== false);
}

export function getActionsForAutomation(): ActionDefinition[] {
  return ALL_ACTIONS.filter(a => a.availableInAutomation !== false);
}

export function getAllActions(): ActionDefinition[] {
  return ALL_ACTIONS;
}

export function getActionByType(type: string): ActionDefinition | undefined {
  return ALL_ACTIONS.find(a => a.type === type);
}

export function getActionsByCategory(category: ActionCategory): ActionDefinition[] {
  return ALL_ACTIONS.filter(a => a.category === category);
}