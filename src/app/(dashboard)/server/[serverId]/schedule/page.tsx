"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Clock,
  Plus,
  Trash2,
  Zap,
  Settings2,
  ChevronDown,
  ChevronRight,
  UserPlus,
  UserMinus,
  MessageSquare,
  CircleDot,
  Headphones,
  ShieldPlus,
  ShieldMinus,
  X,
  RefreshCw,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useScheduledMessages, useCreateSchedule, useDeleteSchedule } from "@/hooks/use-schedule";
import { useAllTemplates } from "@/hooks/use-templates";
import {
  DiscordModal,
  DiscordButton,
  DiscordInput,
  DiscordTextarea,
  DiscordLabel,
  DiscordField,
} from "@/components/shared/discord-modal";
import type { ScheduledMessage } from "@/types/template";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";

// ── Constants ────────────────────────────────────────────────────────────────

type TriggerType = "TIME" | "EVENT";
type TemplateType = "embed" | "text" | "container";
type EditMode = "SEND_NEW" | "EDIT_PREVIOUS";

const DISCORD_EVENTS = [
  { value: "MEMBER_JOIN", label: "Member Join", icon: UserPlus },
  { value: "MEMBER_LEAVE", label: "Member Leave", icon: UserMinus },
  { value: "MESSAGE_SENT", label: "Message Sent", icon: MessageSquare },
  { value: "MESSAGE_REACTION_ADD", label: "Reaction Added", icon: CircleDot },
  { value: "VOICE_JOIN", label: "Voice Join", icon: Headphones },
  { value: "VOICE_LEAVE", label: "Voice Leave", icon: Headphones },
  { value: "ROLE_ASSIGNED", label: "Role Assigned", icon: ShieldPlus },
  { value: "ROLE_REMOVED", label: "Role Removed", icon: ShieldMinus },
] as const;

const TIME_PRESETS = [
  { label: "Once", value: "once" },
  { label: "Every hour", value: "hourly" },
  { label: "Every day", value: "daily" },
  { label: "Every week", value: "weekly" },
  { label: "Every month", value: "monthly" },
];

const REPEAT_CRON: Record<string, string> = {
  hourly: "0 * * * *",
  daily: "0 0 * * *",
  weekly: "0 0 * * 0",
  monthly: "0 0 1 * *",
};

// ── Trigger Badge ───────────────────────────────────────────────────────────

function TriggerBadge({ trigger, event }: { trigger: TriggerType; event?: string }) {
  if (trigger === "EVENT") {
    const found = DISCORD_EVENTS.find((e) => e.value === event);
    const Icon = found?.icon ?? Zap;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#5865F2]/20 text-[#7289DA] text-xs border border-[#5865F2]/30">
        <Icon className="h-3 w-3" />
        {found?.label ?? event}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#43B581]/20 text-[#43B581] text-xs border border-[#43B581]/30">
      <Clock className="h-3 w-3" />
      Time-based
    </span>
  );
}

// ── Collapsible Settings Section ────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  description,
  isOpen,
  onToggle,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-2.5 text-left group mb-3"
    >
      <div className="w-6 h-6 rounded bg-[#4E5058] flex items-center justify-center flex-shrink-0 group-hover:bg-[#6D6F78] transition-colors">
        <Icon className="h-3.5 w-3.5 text-[#B5BAC1]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        {description && <p className="text-xs text-[#80848E] mt-0.5">{description}</p>}
      </div>
      {isOpen ? (
        <ChevronDown className="h-4 w-4 text-[#80848E] flex-shrink-0" />
      ) : (
        <ChevronRight className="h-4 w-4 text-[#80848E] flex-shrink-0" />
      )}
    </button>
  );
}

// ── Inline Editor Card ──────────────────────────────────────────────────────

interface InlineEditorProps {
  serverId: string;
  existingSchedules?: ScheduledMessage[];
  onClose: () => void;
}

function InlineEditor({ serverId, existingSchedules = [], onClose }: InlineEditorProps) {
  const [triggerType, setTriggerType] = useState<TriggerType>("TIME");
  const [templateType, setTemplateType] = useState<TemplateType>("embed");
  const [templateId, setTemplateId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [repeatPreset, setRepeatPreset] = useState("once");
  const [eventType, setEventType] = useState("");
  const [name, setName] = useState("");
  const [editMode, setEditMode] = useState<EditMode>("SEND_NEW");
  const [linkedScheduleId, setLinkedScheduleId] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { embeds, containers, texts, isLoading: templatesLoading } = useAllTemplates(serverId);
  const create = useCreateSchedule(serverId);

  const templatesByType =
    templateType === "embed" ? embeds : templateType === "container" ? containers : texts;
  const selectedTemplate = templatesByType.find((t) => t.id === templateId);

  const isValid =
    name.trim() &&
    templateId &&
    channelId.trim() &&
    (triggerType === "TIME" ? scheduledAt : eventType);

  const isEditMode = editMode === "EDIT_PREVIOUS";

  function buildPayload(): Record<string, unknown> {
    const cronExpr = repeatPreset !== "once" ? REPEAT_CRON[repeatPreset] : undefined;
    const payload: Record<string, unknown> = {
      channelId: channelId.trim(),
      scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined,
      repeatInterval: cronExpr,
      edit_mode: editMode,
      linked_message_schedule_id: isEditMode && linkedScheduleId ? linkedScheduleId : undefined,
      ...(templateType === "embed" && { embedTemplateId: templateId }),
      ...(templateType === "text" && { textTemplateId: templateId }),
      ...(templateType === "container" && { containerTemplateId: templateId }),
    };
    return payload;
  }

  async function handleSubmit() {
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      await create.mutateAsync(buildPayload() as Parameters<typeof create.mutateAsync>[0]);
      onClose();
    } catch {
      // toast handled by hook
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[4px] border border-[#3C3F45] bg-[#2B2D31] overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-[#3C3F45] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#5865F2]/20 flex items-center justify-center">
            <Plus className="h-4 w-4 text-[#7289DA]" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">New Scheduled Message</h2>
            <p className="text-xs text-[#80848E]">Configure your automated message delivery</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-[#80848E] hover:text-[#DBDEE1] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Body */}
      <div className="px-5 py-5 space-y-4">
        {/* Schedule Name */}
        <DiscordField label="Schedule Name" required>
          <DiscordInput
            placeholder="e.g. Daily leaderboard update"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DiscordField>

        {/* Trigger Type Toggle */}
        <div className="flex gap-1 bg-[#1E1F22] rounded-[4px] p-1">
          {(["TIME", "EVENT"] as TriggerType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTriggerType(t)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-[3px] text-sm font-medium transition-all outline-none",
                triggerType === t
                  ? "bg-[#5865F2] text-white"
                  : "text-[#B5BAC1] hover:text-white hover:bg-[#2B2D31]"
              )}
            >
              {t === "TIME" ? <Clock className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
              {t === "TIME" ? "Time-based" : "Event-based"}
            </button>
          ))}
        </div>

        {/* TIME CONFIG */}
        {triggerType === "TIME" && (
          <div className="grid grid-cols-2 gap-3">
            <DiscordField label="Date & Time" required>
              <DiscordInput
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </DiscordField>
            <DiscordField label="Repeat">
              <div className="relative">
                <select
                  value={repeatPreset}
                  onChange={(e) => setRepeatPreset(e.target.value)}
                  className="w-full bg-[#1E1F22] text-[#DBDEE1] border-none rounded-[3px] px-3 py-2.5 outline-none transition-all appearance-none cursor-pointer focus:ring-1 focus:ring-[#00A8FC] pr-8 text-sm"
                >
                  {TIME_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#80848E] pointer-events-none" />
              </div>
            </DiscordField>
          </div>
        )}

        {/* EVENT CONFIG */}
        {triggerType === "EVENT" && (
          <DiscordField
            label="Discord Event"
            required
            helperText="Which Discord event triggers this message?"
          >
            <div className="grid grid-cols-2 gap-2">
              {DISCORD_EVENTS.map((e) => {
                const Icon = e.icon;
                return (
                  <button
                    key={e.value}
                    type="button"
                    onClick={() => setEventType(e.value)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-[3px] text-sm text-left transition-all outline-none",
                      eventType === e.value
                        ? "bg-[#5865F2] text-white"
                        : "bg-[#1E1F22] text-[#DBDEE1] hover:bg-[#2B2D31]"
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {e.label}
                  </button>
                );
              })}
            </div>
          </DiscordField>
        )}

        {/* Message Section Header */}
        <SectionHeader
          icon={MessageSquare}
          title="Message"
          description="What to send and where"
          isOpen={true}
          onToggle={() => {}}
        />

        {/* Message Type Tabs */}
        <DiscordField label="Message Type" required>
          <div className="flex gap-1 bg-[#1E1F22] rounded-[4px] p-1">
            {(["embed", "text", "container"] as TemplateType[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTemplateType(t); setTemplateId(""); }}
                className={cn(
                  "flex-1 py-2 rounded-[3px] text-sm font-medium capitalize transition-all outline-none",
                  templateType === t
                    ? "bg-[#5865F2] text-white"
                    : "text-[#B5BAC1] hover:text-white hover:bg-[#2B2D31]"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </DiscordField>

        {/* Message + Channel grid */}
        <div className="grid grid-cols-2 gap-3">
          <DiscordField label="Message" required>
            {templatesLoading ? (
              <Skeleton className="h-9 w-full rounded-[3px]" />
            ) : (
              <div className="relative">
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full bg-[#1E1F22] text-[#DBDEE1] border-none rounded-[3px] px-3 py-2.5 outline-none transition-all appearance-none cursor-pointer focus:ring-1 focus:ring-[#00A8FC] pr-8 text-sm"
                >
                  <option value="">Select a message…</option>
                  {templatesByType.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#80848E] pointer-events-none" />
              </div>
            )}
          </DiscordField>

          <DiscordField label="Channel ID" required>
            <DiscordInput
              placeholder="Channel ID or #channel"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              className="font-mono text-xs"
            />
          </DiscordField>
        </div>

        {/* Selected message preview */}
        {selectedTemplate && (
          <div className="rounded-[3px] bg-[#1E1F22] border border-[#3C3F45] p-3">
            <p className="text-xs text-[#80848E] mb-1.5 font-medium uppercase tracking-wide">
              Selected: {selectedTemplate.name}
            </p>
            {templateType === "text" && "content" in selectedTemplate && (
              <p className="text-sm text-[#DBDEE1] line-clamp-3">
                {(selectedTemplate as { content: string }).content}
              </p>
            )}
            {templateType === "embed" && (
              <p className="text-sm text-[#DBDEE1]">
                {(selectedTemplate as { description?: string }).description ?? "Embed message"}
              </p>
            )}
            {templateType === "container" && (
              <p className="text-sm text-[#DBDEE1]">Container message</p>
            )}
          </div>
        )}

        {/* Settings Section Header */}
        <SectionHeader
          icon={Settings2}
          title="Settings"
          description="Advanced options for recurring messages"
          isOpen={showSettings}
          onToggle={() => setShowSettings(!showSettings)}
        />

        {/* Settings Body */}
        {showSettings && (
          <div className="space-y-4 pb-1">
            {/* Edit Mode Toggle */}
            <DiscordField
              label="Message Delivery"
              helperText={
                editMode === "EDIT_PREVIOUS"
                  ? "Updates the same Discord message each run instead of posting new ones"
                  : "Posts a new message on each run"
              }
            >
              <div className="flex gap-1 bg-[#1E1F22] rounded-[4px] p-1">
                <button
                  type="button"
                  onClick={() => setEditMode("SEND_NEW")}
                  className={cn(
                    "flex-1 flex items-center gap-2 py-2 rounded-[3px] text-sm font-medium transition-all outline-none",
                    editMode === "SEND_NEW"
                      ? "bg-[#5865F2] text-white"
                      : "text-[#B5BAC1] hover:text-white hover:bg-[#2B2D31]"
                  )}
                >
                  <Plus className="h-4 w-4" />
                  Send New
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode("EDIT_PREVIOUS")}
                  className={cn(
                    "flex-1 flex items-center gap-2 py-2 rounded-[3px] text-sm font-medium transition-all outline-none",
                    editMode === "EDIT_PREVIOUS"
                      ? "bg-[#5865F2] text-white"
                      : "text-[#B5BAC1] hover:text-white hover:bg-[#2B2D31]"
                  )}
                >
                  <RefreshCw className="h-4 w-4" />
                  Edit Previous
                </button>
              </div>
            </DiscordField>

            {/* Linked Schedule Picker — only for EDIT_PREVIOUS */}
            {isEditMode && (
              <DiscordField
                label="Linked Schedule"
                helperText="The schedule whose message will be edited. Must have been sent at least once."
              >
                <div className="relative">
                  <select
                    value={linkedScheduleId}
                    onChange={(e) => setLinkedScheduleId(e.target.value)}
                    className="w-full bg-[#1E1F22] text-[#DBDEE1] border-none rounded-[3px] px-3 py-2.5 outline-none transition-all appearance-none cursor-pointer focus:ring-1 focus:ring-[#00A8FC] pr-8 text-sm"
                  >
                    <option value="">Select a schedule to edit…</option>
                    {existingSchedules
                      .filter((s) => s.discord_message_id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} — {s.discord_message_id}
                        </option>
                      ))}
                    {existingSchedules.filter((s) => s.discord_message_id).length === 0 && (
                      <option disabled value="">
                        No schedules with sent messages yet
                      </option>
                    )}
                  </select>
                  <Link2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#80848E] pointer-events-none" />
                </div>
                {!linkedScheduleId && (
                  <p className="text-xs text-[#F23F42] mt-1.5 italic">
                    Select a schedule to enable edit mode
                  </p>
                )}
              </DiscordField>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#3C3F45] flex items-center justify-end gap-3">
        <DiscordButton variant="secondary" onClick={onClose}>
          Cancel
        </DiscordButton>
        <DiscordButton
          variant="primary"
          disabled={
            !isValid ||
            isSubmitting ||
            (isEditMode && !linkedScheduleId)
          }
          onClick={handleSubmit}
        >
          {isSubmitting ? "Creating…" : "Create Schedule"}
        </DiscordButton>
      </div>
    </div>
  );
}

// ── Schedule Row Card ───────────────────────────────────────────────────────

function ScheduleRow({
  schedule,
  onDelete,
  isDeleting,
}: {
  schedule: ScheduledMessage;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const type = schedule.embedTemplateId
    ? "embed"
    : schedule.textTemplateId
    ? "text"
    : "container";

  const repeatLabel =
    schedule.repeatInterval === "hourly"
      ? "Every hour"
      : schedule.repeatInterval === "daily"
      ? "Every day"
      : schedule.repeatInterval === "weekly"
      ? "Every week"
      : schedule.repeatInterval === "monthly"
      ? "Every month"
      : "One-time";

  return (
    <div className="rounded-[4px] border border-[#3C3F45] bg-[#2B2D31] p-4 hover:border-[#5865F2]/40 transition-colors">
      <div className="flex items-start justify-between gap-4">
        {/* Left: icon + name + meta */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#313338] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Clock className="h-4 w-4 text-[#7289DA]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white truncate">{schedule.name || repeatLabel}</span>
              <Badge className="bg-[#313338] text-[#B5BAC1] border border-[#3C3F45] text-xs capitalize">
                {type}
              </Badge>
              {schedule.edit_mode === "EDIT_PREVIOUS" && (
                <Badge className="bg-[#F0A500]/20 text-[#F0A500] border border-[#F0A500]/30 text-xs gap-1">
                  <RefreshCw className="h-3 w-3" />
                  Edit mode
                </Badge>
              )}
              {schedule.isActive ? (
                <Badge className="bg-[#43B581]/20 text-[#43B581] border border-[#43B581]/30 text-xs">
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs text-[#80848E]">
                  Paused
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-[#80848E]">
              <span className="font-mono">{schedule.channelId}</span>
              {schedule.scheduledAt && (
                <span>Next: {format(new Date(schedule.scheduledAt), "MMM d, yyyy 'at' h:mm a")}</span>
              )}
              {schedule.discord_message_id && (
                <span className="text-[#5865F2]">Msg ID: {schedule.discord_message_id}</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: delete */}
        <button
          onClick={() => onDelete(schedule.id)}
          disabled={isDeleting}
          className="flex-shrink-0 text-[#80848E] hover:text-[#F23F42] transition-colors p-1 rounded-[3px] hover:bg-[#F23F42]/10"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-[4px] border border-dashed border-[#3C3F45] py-16 text-center">
      <Clock className="mx-auto h-8 w-8 text-[#80848E] mb-3" />
      <p className="text-sm text-[#80848E] mb-1">No scheduled messages yet.</p>
      <p className="text-xs text-[#6D6F78] mb-5">
        Create your first schedule to automate message delivery.
      </p>
      <Button
        onClick={onCreate}
        size="sm"
        className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Create one
      </Button>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const { serverId } = useParams<{ serverId: string }>();
  const [isCreating, setIsCreating] = useState(false);

  const { data: schedules, isLoading } = useScheduledMessages(serverId);
  const deleteSchedule = useDeleteSchedule(serverId);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this schedule?")) return;
    await deleteSchedule.mutateAsync(id);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="h-6 w-6 text-[#7289DA]" />
            Scheduled Messages
          </h1>
          <p className="text-sm text-[#80848E] mt-0.5">
            Automate Discord message delivery with time-based or event-based triggers.
          </p>
        </div>
        {!isCreating && schedules && schedules.length > 0 && (
          <Button
            onClick={() => setIsCreating(true)}
            size="sm"
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white shrink-0"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Schedule
          </Button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-[4px]" />
          ))}
        </div>
      )}

      {/* Empty state or inline editor */}
      {!isLoading && (isCreating || !schedules?.length) && (
        <InlineEditor
          serverId={serverId}
          existingSchedules={schedules}
          onClose={() => setIsCreating(false)}
        />
      )}

      {/* Schedule list */}
      {!isLoading && schedules && schedules.length > 0 && (
        <div className="space-y-3">
          {/* Inline editor prepended to list */}
          {isCreating && (
            <InlineEditor
              serverId={serverId}
              existingSchedules={schedules}
              onClose={() => setIsCreating(false)}
            />
          )}

          {schedules.map((s) => (
            <ScheduleRow
              key={s.id}
              schedule={s}
              onDelete={handleDelete}
              isDeleting={deleteSchedule.isPending}
            />
          ))}
        </div>
      )}

      {/* Empty state when there are no schedules and not creating */}
      {!isLoading && !isCreating && !schedules?.length && (
        <EmptyState onCreate={() => setIsCreating(true)} />
      )}
    </div>
  );
}
