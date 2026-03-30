"use client";

import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EventFilter, EventFilterOperator } from "@/components/component-v2/types";

const OPERATORS: { value: EventFilterOperator; label: string }[] = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "does not equal" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
  { value: "in", label: "is one of" },
  { value: "not_in", label: "is not one of" },
  { value: "matches", label: "matches regex" },
];

// Fields available for filtering per event type
const EVENT_TYPE_FIELDS: Record<string, { value: string; label: string }[]> = {
  MEMBER_JOIN: [
    { value: "member.roles", label: "Member has role" },
    { value: "member.createdAt", label: "Account created after" },
    { value: "member.avatar", label: "Has avatar" },
  ],
  MEMBER_LEAVE: [
    { value: "member.roles", label: "Member had role" },
  ],
  MESSAGE_SENT: [
    { value: "message.content", label: "Message contains" },
    { value: "channel.id", label: "Channel is" },
    { value: "channel.name", label: "Channel name contains" },
    { value: "message.author.roles", label: "Author has role" },
  ],
  MESSAGE_REACTION_ADD: [
    { value: "emoji.name", label: "Emoji is" },
    { value: "channel.id", label: "Channel is" },
    { value: "message.author.roles", label: "Author has role" },
  ],
  VOICE_JOIN: [
    { value: "member.roles", label: "Member has role" },
    { value: "channel.id", label: "Channel is" },
  ],
  VOICE_LEAVE: [
    { value: "member.roles", label: "Member has role" },
    { value: "channel.id", label: "Channel is" },
  ],
  ROLE_ASSIGNED: [
    { value: "role.id", label: "Role assigned" },
  ],
  ROLE_REMOVED: [
    { value: "role.id", label: "Role removed" },
  ],
};

const EVENT_LABELS: Record<string, string> = {
  MEMBER_JOIN: "member join",
  MEMBER_LEAVE: "member leave",
  MESSAGE_SENT: "message",
  MESSAGE_REACTION_ADD: "reaction add",
  VOICE_JOIN: "voice join",
  VOICE_LEAVE: "voice leave",
  ROLE_ASSIGNED: "role assigned",
  ROLE_REMOVED: "role removed",
};

const DEFAULT_FIELDS = [
  { value: "member.roles", label: "Member has role" },
  { value: "channel.id", label: "Channel" },
  { value: "channel.name", label: "Channel name" },
  { value: "message.content", label: "Message content" },
];

function uid() {
  return crypto.randomUUID();
}

function createFilter(): EventFilter {
  return { id: uid(), field: "", operator: "equals", value: "" };
}

interface EventFilterBuilderProps {
  eventType: string;
  filters: EventFilter[];
  onChange: (filters: EventFilter[]) => void;
}

export function EventFilterBuilder({ eventType, filters, onChange }: EventFilterBuilderProps) {
  const availableFields = EVENT_TYPE_FIELDS[eventType] ?? DEFAULT_FIELDS;

  function addFilter() {
    onChange([...filters, createFilter()]);
  }

  function updateFilter(id: string, patch: Partial<EventFilter>) {
    onChange(filters.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function removeFilter(id: string) {
    onChange(filters.filter((f) => f.id !== id));
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[#B5BAC1] uppercase tracking-wide">Filters</p>
          <p className="text-[10px] text-[#6D6F78] mt-0.5">
            {filters.length === 0 ? "No filters — all events match" : `${filters.length} filter${filters.length !== 1 ? "s" : ""} applied`}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addFilter}
          className="text-xs text-[#5865F2] hover:text-white hover:bg-[#5865F2]/10 h-7 px-2"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Filter
        </Button>
      </div>

      {/* Filter list */}
      {filters.length === 0 && (
        <div className="rounded-[3px] border border-dashed border-[#3C3F45] p-4 text-center">
          <p className="text-xs text-[#6D6F78]">No filters — this automation runs on every {EVENT_LABELS[eventType] ?? "event"}</p>
        </div>
      )}

      {filters.map((filter) => (
        <FilterRow
          key={filter.id}
          filter={filter}
          availableFields={availableFields}
          onChange={(patch) => updateFilter(filter.id, patch)}
          onRemove={() => removeFilter(filter.id)}
        />
      ))}

      {/* Filter logic */}
      {filters.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#80848E]">Match:</span>
          <select className="bg-[#1E1F22] text-[#DBDEE1] border border-[#3C3F45] rounded-[3px] px-2 py-1 text-xs outline-none">
            <option value="all">All filters (AND)</option>
            <option value="any">Any filter (OR)</option>
          </select>
        </div>
      )}
    </div>
  );
}

function FilterRow({
  filter,
  availableFields,
  onChange,
  onRemove,
}: {
  filter: EventFilter;
  availableFields: { value: string; label: string }[];
  onChange: (patch: Partial<EventFilter>) => void;
  onRemove: () => void;
}) {
  const needsValue = !["in", "not_in"].includes(filter.operator);

  return (
    <div className="rounded-[3px] border border-[#3C3F45] bg-[#1E1F22] p-3 space-y-2">
      <div className="flex items-center gap-2">
        {/* Field */}
        <select
          value={filter.field}
          onChange={(e) => onChange({ field: e.target.value })}
          className="flex-1 bg-[#2B2D31] text-[#DBDEE1] border border-[#3C3F45] rounded-[3px] px-2 py-1.5 text-xs outline-none focus:border-[#5865F2] min-w-0"
        >
          <option value="">Field…</option>
          {availableFields.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {/* Operator */}
        <select
          value={filter.operator}
          onChange={(e) => onChange({ operator: e.target.value as EventFilterOperator })}
          className="w-36 bg-[#2B2D31] text-[#DBDEE1] border border-[#3C3F45] rounded-[3px] px-2 py-1.5 text-xs outline-none focus:border-[#5865F2]"
        >
          {OPERATORS.map((op) => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>

        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 text-[#6D6F78] hover:text-[#F23F42] transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Value — show text input for single values, textarea for "in" operators */}
      {needsValue && filter.field && (
        filter.operator === "matches" ? (
          <input
            type="text"
            value={filter.value}
            onChange={(e) => onChange({ value: e.target.value })}
            placeholder="Regex pattern…"
            className="w-full bg-[#2B2D31] text-[#DBDEE1] border border-[#3C3F45] rounded-[3px] px-2 py-1.5 text-xs font-mono outline-none focus:border-[#5865F2] placeholder-[#6D6F78]"
          />
        ) : (
          <input
            type="text"
            value={filter.value}
            onChange={(e) => onChange({ value: e.target.value })}
            placeholder="Value…"
            className="w-full bg-[#2B2D31] text-[#DBDEE1] border border-[#3C3F45] rounded-[3px] px-2 py-1.5 text-xs outline-none focus:border-[#5865F2] placeholder-[#6D6F78]"
          />
        )
      )}

      {/* Multi-value for "in" / "not_in" */}
      {!needsValue && (
        <textarea
          value={filter.value}
          onChange={(e) => onChange({ value: e.target.value })}
          placeholder="Comma-separated values: value1, value2, value3"
          rows={2}
          className="w-full bg-[#2B2D31] text-[#DBDEE1] border border-[#3C3F45] rounded-[3px] px-2 py-1.5 text-xs outline-none focus:border-[#5865F2] placeholder-[#6D6F78] resize-none"
        />
      )}
    </div>
  );
}
