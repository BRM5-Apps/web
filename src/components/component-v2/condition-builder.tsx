"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  GripVertical,
  X,
  WrapText,
} from "lucide-react";
import type {
  ConditionNode,
  ConditionOperator,
  ValueSource,
  AndCondition,
  OrCondition,
  NotCondition,
  EqualCondition,
  InCondition,
  MemberHasRoleCondition,
  MemberHasPermissionCondition,
  GreaterThanCondition,
  LessThanCondition,
  IsEmptyCondition,
  IsNotEmptyCondition,
} from "./types";

// ── Condition Categories ────────────────────────────────────────────────────

const CONDITION_CATEGORIES = {
  logical: {
    label: "Logic",
    description: "Combine multiple conditions",
    operators: [
      { value: "and", label: "And", description: "All conditions must be true" },
      { value: "or", label: "Or", description: "At least one condition must be true" },
      { value: "not", label: "Not", description: "Condition must be false" },
    ],
  },
  comparison: {
    label: "Compare",
    description: "Compare values",
    operators: [
      { value: "equal", label: "Equal", description: "Two values are equal" },
      { value: "greater_than", label: "Greater Than", description: "Left value is greater" },
      { value: "less_than", label: "Less Than", description: "Left value is smaller" },
      { value: "in", label: "In", description: "Value exists in array" },
    ],
  },
  discord: {
    label: "Discord",
    description: "Discord-specific checks",
    operators: [
      { value: "member_has_role", label: "Member Has Role", description: "Check if user has a role" },
      { value: "member_has_permission", label: "Member Has Permission", description: "Check Discord permission" },
      { value: "channel_is", label: "Channel Is", description: "Check channel ID" },
    ],
  },
  presence: {
    label: "Presence",
    description: "Check if values exist",
    operators: [
      { value: "is_empty", label: "Is Empty", description: "Value is empty or null" },
      { value: "is_not_empty", label: "Is Not Empty", description: "Value exists" },
    ],
  },
} as const;

const ALL_OPERATORS = Object.values(CONDITION_CATEGORIES).flatMap((cat) =>
  cat.operators.map((op) => ({ ...op, category: cat.label }))
);

// ── Helper Functions ────────────────────────────────────────────────────────

function uid(): string {
  return crypto.randomUUID();
}

export function createCondition(operator: ConditionOperator): ConditionNode {
  const base = { id: uid(), operator };

  switch (operator) {
    case "and":
    case "or":
      return { ...base, operator, conditions: [] } as AndCondition | OrCondition;
    case "not":
      return { ...base, operator, condition: createDefaultCondition() } as NotCondition;
    case "equal":
      return { ...base, operator, left: { type: "static", value: "" }, right: { type: "static", value: "" } } as EqualCondition;
    case "in":
      return { ...base, operator, element: { type: "static", value: "" }, array: { type: "static", value: "[]" } } as InCondition;
    case "member_has_role":
      return { ...base, operator, roleId: "" } as MemberHasRoleCondition;
    case "member_has_permission":
      return { ...base, operator, permission: "SEND_MESSAGES" } as MemberHasPermissionCondition;
    case "greater_than":
    case "less_than":
      return { ...base, operator, left: { type: "static", value: "0" }, right: { type: "static", value: "0" } } as GreaterThanCondition | LessThanCondition;
    case "is_empty":
    case "is_not_empty":
      return { ...base, operator, value: { type: "static", value: "" } } as IsEmptyCondition | IsNotEmptyCondition;
    case "channel_is":
      return { ...base, operator, channelId: "" };
    default:
      return createDefaultCondition();
  }
}

function createDefaultCondition(): ConditionNode {
  return {
    id: uid(),
    operator: "equal",
    left: { type: "static", value: "" },
    right: { type: "static", value: "" },
  } as EqualCondition;
}

// Wrap an existing condition in a logical operator
function wrapCondition(
  condition: ConditionNode,
  wrapper: "and" | "or" | "not"
): ConditionNode {
  const wrapperId = uid();

  if (wrapper === "not") {
    return {
      id: wrapperId,
      operator: "not",
      condition: condition,
    } as NotCondition;
  }

  // For and/or, wrap in a group with the existing condition as first item
  return {
    id: wrapperId,
    operator: wrapper,
    conditions: [condition, createDefaultCondition()],
  } as AndCondition | OrCondition;
}

// ── Condition Builder Component ──────────────────────────────────────────────

interface ConditionBuilderProps {
  condition?: ConditionNode;
  onChange: (condition: ConditionNode | undefined) => void;
  serverId?: string;
  depth?: number;
}

export function ConditionBuilder({
  condition,
  onChange,
  serverId,
  depth = 0,
}: ConditionBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!condition) {
    return (
      <div className="rounded-lg border border-dashed border-[#3f4147] bg-[#1e1f22]/50 p-6 text-center">
        <p className="text-sm text-[#b5bac1] mb-3">No condition set</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="bg-[#5865F2] hover:bg-[#4752c4] text-white">
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Condition
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#2b2d31] border-[#3f4147] text-white w-56">
            {Object.entries(CONDITION_CATEGORIES).map(([key, category]) => (
              <div key={key}>
                <div className="px-2 py-1.5 text-xs font-semibold text-[#b5bac1] uppercase tracking-wider">
                  {category.label}
                </div>
                {category.operators.map((op) => (
                  <DropdownMenuItem
                    key={op.value}
                    onClick={() => onChange(createCondition(op.value as ConditionOperator))}
                    className="hover:bg-[#5865F2] cursor-pointer focus:bg-[#5865F2]"
                  >
                    <div>
                      <div className="text-sm">{op.label}</div>
                      <div className="text-[10px] text-[#b5bac1]">{op.description}</div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-[#3f4147]" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  const isLogical = condition.operator === "and" || condition.operator === "or";
  const isNot = condition.operator === "not";
  const canNest = isLogical || isNot;

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        canNest
          ? "border-[#5865F2]/30 bg-[#5865F2]/5"
          : "border-[#3f4147] bg-[#111214]"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        {canNest && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[#b5bac1] hover:text-white"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        {!canNest && <GripVertical className="h-4 w-4 text-[#b5bac1]" />}

        <OperatorSelect
          value={condition.operator}
          onChange={(op) => onChange(createCondition(op))}
        />

        {/* Wrap buttons for non-logical conditions */}
        {!isLogical && !isNot && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="ml-2 text-[#b5bac1] hover:text-white p-1 rounded hover:bg-[#3f4147]"
                title="Wrap in..."
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#2b2d31] border-[#3f4147] text-white">
              <div className="px-2 py-1 text-[10px] font-semibold text-[#b5bac1] uppercase">
                Wrap in
              </div>
              <DropdownMenuItem
                onClick={() => onChange(wrapCondition(condition, "and"))}
                className="hover:bg-[#5865F2] cursor-pointer"
              >
                <span className="text-sm">And Group</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onChange(wrapCondition(condition, "or"))}
                className="hover:bg-[#5865F2] cursor-pointer"
              >
                <span className="text-sm">Or Group</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onChange(wrapCondition(condition, "not"))}
                className="hover:bg-[#5865F2] cursor-pointer"
              >
                <span className="text-sm">Not (Negate)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="ml-auto text-[#b5bac1] hover:text-red-400 p-1 rounded hover:bg-[#3f4147]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className={cn("pl-0", canNest && "pl-6")}>
          <ConditionContent
            condition={condition}
            onChange={onChange}
            serverId={serverId}
            depth={depth}
          />
        </div>
      )}
    </div>
  );
}

// ── Operator Select ───────────────────────────────────────────────────────

interface OperatorSelectProps {
  value: ConditionOperator;
  onChange: (operator: ConditionOperator) => void;
}

function OperatorSelect({ value, onChange }: OperatorSelectProps) {
  const selected = ALL_OPERATORS.find((op) => op.value === value);

  return (
    <Select value={value} onValueChange={(v) => onChange(v as ConditionOperator)}>
      <SelectTrigger className="w-auto min-w-[140px] bg-[#1e1f22] border-[#3f4147] text-white text-sm h-8">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span className="text-[#5865F2] font-medium">{selected?.label}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-[#2b2d31] border-[#3f4147] text-white">
        {Object.entries(CONDITION_CATEGORIES).map(([key, category]) => (
          <div key={key}>
            <div className="px-2 py-1 text-[10px] font-semibold text-[#b5bac1] uppercase tracking-wider">
              {category.label}
            </div>
            {category.operators.map((op) => (
              <SelectItem
                key={op.value}
                value={op.value}
                className="text-sm focus:bg-[#5865F2] focus:text-white cursor-pointer"
              >
                {op.label}
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}

// ── Condition Content (Renders specific UI based on operator) ────────────────

interface ConditionContentProps {
  condition: ConditionNode;
  onChange: (condition: ConditionNode) => void;
  serverId?: string;
  depth: number;
}

function ConditionContent({ condition, onChange, serverId, depth }: ConditionContentProps) {
  switch (condition.operator) {
    case "and":
    case "or": {
      const c = condition as AndCondition | OrCondition;
      return (
        <LogicalConditionBuilder
          conditions={c.conditions}
          operator={condition.operator}
          onChange={(conditions) => onChange({ ...c, conditions })}
          serverId={serverId}
          depth={depth + 1}
        />
      );
    }

    case "not": {
      const c = condition as NotCondition;
      return (
        <div className="space-y-2">
          <div className="text-xs text-[#b5bac1] mb-1">Negate:</div>
          <ConditionBuilder
            condition={c.condition}
            onChange={(cond) =>
              onChange({ ...c, condition: cond ?? createDefaultCondition() })
            }
            serverId={serverId}
            depth={depth + 1}
          />
        </div>
      );
    }

    case "equal":
    case "greater_than":
    case "less_than": {
      const c = condition as EqualCondition | GreaterThanCondition | LessThanCondition;
      return (
        <ComparisonConditionBuilder
          left={c.left}
          right={c.right}
          operator={condition.operator}
          onChange={(left, right) => onChange({ ...c, left, right })}
        />
      );
    }

    case "in": {
      const c = condition as InCondition;
      return (
        <InConditionBuilder
          element={c.element}
          array={c.array}
          onChange={(element, array) => onChange({ ...c, element, array })}
        />
      );
    }

    case "member_has_role": {
      const c = condition as MemberHasRoleCondition;
      return (
        <RoleConditionBuilder
          roleId={c.roleId}
          onChange={(roleId) => onChange({ ...c, roleId })}
          serverId={serverId}
        />
      );
    }

    case "member_has_permission": {
      const c = condition as MemberHasPermissionCondition;
      return (
        <PermissionConditionBuilder
          permission={c.permission}
          onChange={(permission) => onChange({ ...c, permission })}
        />
      );
    }

    case "is_empty":
    case "is_not_empty": {
      const c = condition as IsEmptyCondition | IsNotEmptyCondition;
      return (
        <ValueSourceBuilder
          value={c.value}
          onChange={(value) => onChange({ ...c, value })}
          placeholder="Value to check"
        />
      );
    }

    case "channel_is": {
      const c = condition as { id: string; operator: "channel_is"; channelId: string };
      return (
        <div className="space-y-2">
          <Label className="text-xs text-[#b5bac1]">Channel ID</Label>
          <Input
            value={c.channelId}
            onChange={(e) => onChange({ ...c, channelId: e.target.value })}
            placeholder="Channel ID or {{element:channelId}}"
            className="w-full bg-[#1e1f22] border-[#3f4147] text-white text-sm h-8"
          />
        </div>
      );
    }

    default:
      return (
        <div className="text-xs text-[#b5bac1] italic">
          Configure this condition (operator: {condition.operator})
        </div>
      );
  }
}

// ── Logical Condition Builder (And/Or) ──────────────────────────────────────

interface LogicalConditionBuilderProps {
  conditions: ConditionNode[];
  operator: "and" | "or";
  onChange: (conditions: ConditionNode[]) => void;
  serverId?: string;
  depth: number;
}

function LogicalConditionBuilder({
  conditions,
  operator,
  onChange,
  serverId,
  depth,
}: LogicalConditionBuilderProps) {
  const label = operator === "and" ? "All of:" : "Any of:";
  const buttonLabel = operator === "and" ? "Add more checks" : "Add more options";

  function addCondition(op: ConditionOperator) {
    onChange([...conditions, createCondition(op)]);
  }

  function updateCondition(index: number, cond: ConditionNode | undefined) {
    if (!cond) {
      onChange(conditions.filter((_, i) => i !== index));
    } else {
      onChange(conditions.map((c, i) => (i === index ? cond : c)));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#b5bac1] font-medium">{label}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-7 text-xs bg-[#5865F2]/20 text-[#5865F2] hover:bg-[#5865F2] hover:text-white border border-[#5865F2]/30">
              <Plus className="mr-1 h-3 w-3" />
              {buttonLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#2b2d31] border-[#3f4147] text-white">
            {Object.entries(CONDITION_CATEGORIES).map(([key, category]) => (
              <div key={key}>
                <div className="px-2 py-1 text-[10px] font-semibold text-[#b5bac1] uppercase">
                  {category.label}
                </div>
                {category.operators.map((op) => (
                  <DropdownMenuItem
                    key={op.value}
                    onClick={() => addCondition(op.value as ConditionOperator)}
                    className="text-sm hover:bg-[#5865F2] cursor-pointer"
                  >
                    {op.label}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-[#3f4147]" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {conditions.length === 0 ? (
        <div className="text-xs text-[#b5bac1] p-3 border border-dashed border-[#3f4147] rounded text-center bg-[#1e1f22]/50">
          No conditions added yet. Click &quot;{buttonLabel}&quot; to start building.
        </div>
      ) : (
        <div className="space-y-2">
          {conditions.map((cond, index) => (
            <ConditionBuilder
              key={cond.id}
              condition={cond}
              onChange={(c) => updateCondition(index, c)}
              serverId={serverId}
              depth={depth}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Comparison Condition Builder ────────────────────────────────────────────

interface ComparisonConditionBuilderProps {
  left: ValueSource;
  right: ValueSource;
  operator: "equal" | "greater_than" | "less_than";
  onChange: (left: ValueSource, right: ValueSource) => void;
}

function ComparisonConditionBuilder({
  left,
  right,
  operator,
  onChange,
}: ComparisonConditionBuilderProps) {
  const operatorLabel =
    operator === "equal" ? "equals" : operator === "greater_than" ? ">" : "<";

  return (
    <div className="space-y-2">
      <div>
        <Label className="text-xs text-[#b5bac1]">Left Value</Label>
        <ValueSourceInput
          value={left}
          onChange={(v) => onChange(v, right)}
          placeholder="Left value"
        />
      </div>
      <div className="flex items-center justify-center">
        <span className="text-xs text-[#5865F2] font-medium px-2 py-1 bg-[#5865F2]/10 rounded">{operatorLabel}</span>
      </div>
      <div>
        <Label className="text-xs text-[#b5bac1]">Right Value</Label>
        <ValueSourceInput
          value={right}
          onChange={(v) => onChange(left, v)}
          placeholder="Right value"
        />
      </div>
    </div>
  );
}

// ── In Condition Builder ────────────────────────────────────────────────────

interface InConditionBuilderProps {
  element: ValueSource;
  array: ValueSource;
  onChange: (element: ValueSource, array: ValueSource) => void;
}

function InConditionBuilder({ element, array, onChange }: InConditionBuilderProps) {
  return (
    <div className="space-y-2">
      <div>
        <Label className="text-xs text-[#b5bac1]">Element to find</Label>
        <ValueSourceInput
          value={element}
          onChange={(v) => onChange(v, array)}
          placeholder="Element to find"
        />
      </div>
      <div>
        <Label className="text-xs text-[#b5bac1]">Array</Label>
        <Input
          value={array.value}
          onChange={(e) =>
            onChange(element, { ...array, value: e.target.value })
          }
          placeholder='["value1", "value2", "value3"] or {{element:array}}'
          className="w-full bg-[#1e1f22] border-[#3f4147] text-white text-sm"
        />
        <p className="text-[10px] text-[#b5bac1] mt-1">
          Enter a JSON array or an element token that resolves to an array
        </p>
      </div>
    </div>
  );
}

// ── Role Condition Builder ──────────────────────────────────────────────────

interface RoleConditionBuilderProps {
  roleId: string;
  onChange: (roleId: string) => void;
  serverId?: string;
}

function RoleConditionBuilder({ roleId, onChange, serverId }: RoleConditionBuilderProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-[#b5bac1]">Role ID</Label>
      <Input
        value={roleId}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Role ID or {{element:roleId}}"
        className="w-full bg-[#1e1f22] border-[#3f4147] text-white text-sm h-8"
      />
    </div>
  );
}

// ── Permission Condition Builder ────────────────────────────────────────────

const DISCORD_PERMISSIONS = [
  "ADMINISTRATOR",
  "MANAGE_GUILD",
  "MANAGE_CHANNELS",
  "MANAGE_ROLES",
  "MANAGE_MESSAGES",
  "MANAGE_THREADS",
  "MANAGE_NICKNAMES",
  "KICK_MEMBERS",
  "BAN_MEMBERS",
  "SEND_MESSAGES",
  "SEND_MESSAGES_IN_THREADS",
  "EMBED_LINKS",
  "ATTACH_FILES",
  "MENTION_EVERYONE",
  "USE_EXTERNAL_EMOJIS",
  "ADD_REACTIONS",
  "VIEW_AUDIT_LOG",
  "VIEW_CHANNEL",
  "READ_MESSAGE_HISTORY",
  "MODERATE_MEMBERS",
  "USE_APPLICATION_COMMANDS",
] as const;

interface PermissionConditionBuilderProps {
  permission: string;
  onChange: (permission: string) => void;
}

function PermissionConditionBuilder({ permission, onChange }: PermissionConditionBuilderProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-[#b5bac1]">Permission</Label>
      <Select value={permission} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-[#1e1f22] border-[#3f4147] text-white text-sm h-8">
          <SelectValue placeholder="Select permission..." />
        </SelectTrigger>
        <SelectContent className="bg-[#2b2d31] border-[#3f4147] text-white max-h-60">
          {DISCORD_PERMISSIONS.map((perm) => (
            <SelectItem
              key={perm}
              value={perm}
              className="text-sm focus:bg-[#5865F2] focus:text-white cursor-pointer"
            >
              {perm}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// ── Value Source Input ───────────────────────────────────────────────────────

interface ValueSourceInputProps {
  value: ValueSource;
  onChange: (value: ValueSource) => void;
  placeholder?: string;
}

function ValueSourceInput({ value, onChange, placeholder }: ValueSourceInputProps) {
  return (
    <div className="flex items-center gap-1 flex-1 min-w-0">
      <Select
        value={value.type}
        onValueChange={(type) => onChange({ ...value, type: type as ValueSource["type"] })}
      >
        <SelectTrigger className="w-[100px] bg-[#1e1f22] border-[#3f4147] text-white text-xs h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-[#2b2d31] border-[#3f4147] text-white">
          <SelectItem value="static" className="text-xs">Static</SelectItem>
          <SelectItem value="element" className="text-xs">Element</SelectItem>
          <SelectItem value="variable" className="text-xs">Variable</SelectItem>
          <SelectItem value="user" className="text-xs">User</SelectItem>
          <SelectItem value="member" className="text-xs">Member</SelectItem>
          <SelectItem value="server" className="text-xs">Server</SelectItem>
          <SelectItem value="channel" className="text-xs">Channel</SelectItem>
          <SelectItem value="message" className="text-xs">Message</SelectItem>
        </SelectContent>
      </Select>
      <Input
        value={value.value}
        onChange={(e) => onChange({ ...value, value: e.target.value })}
        placeholder={placeholder}
        className="flex-1 bg-[#1e1f22] border-[#3f4147] text-white text-sm h-8"
      />
    </div>
  );
}

// ── Value Source Builder (for single value conditions) ──────────────────────

interface ValueSourceBuilderProps {
  value: ValueSource;
  onChange: (value: ValueSource) => void;
  placeholder?: string;
}

function ValueSourceBuilder({ value, onChange, placeholder }: ValueSourceBuilderProps) {
  return (
    <ValueSourceInput value={value} onChange={onChange} placeholder={placeholder} />
  );
}

// ── Condition Summary (for compact display) ─────────────────────────────────

export function conditionSummary(condition?: ConditionNode): string {
  if (!condition) return "No condition";

  switch (condition.operator) {
    case "and":
      return `All of ${(condition as AndCondition).conditions.length} conditions`;
    case "or":
      return `Any of ${(condition as OrCondition).conditions.length} conditions`;
    case "not":
      return `Not: ${conditionSummary((condition as NotCondition).condition)}`;
    case "equal":
      return `${(condition as EqualCondition).left.value} = ${(condition as EqualCondition).right.value}`;
    case "in":
      return `${(condition as InCondition).element.value} in array`;
    case "member_has_role":
      return `Has role ${(condition as MemberHasRoleCondition).roleId}`;
    case "member_has_permission":
      return `Has permission ${(condition as MemberHasPermissionCondition).permission}`;
    case "is_empty":
      return `Is empty`;
    case "is_not_empty":
      return `Is not empty`;
    default:
      return condition.operator;
  }
}

// ── Export for use in ActionFields ──────────────────────────────────────────

export { LogicalConditionBuilder };
