"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  useScheduledSequences,
  useCreateScheduledSequence,
  useUpdateScheduledSequence,
  useDeleteScheduledSequence,
  useValidateCron,
} from "@/hooks/use-scheduled-sequences";
import {
  DiscordModal,
  DiscordButton,
  DiscordInput,
  DiscordTextarea,
  DiscordLabel,
  DiscordField,
} from "@/components/shared/discord-modal";
import type {
  ScheduledSequence,
  CreateScheduledSequencePayload,
} from "@/types/platform-extensions";
import {
  Clock,
  Trash2,
  Edit,
  Plus,
  Play,
  Zap,
  UserPlus,
  UserMinus,
  MessageSquare,
  CircleDot,
  Headphones,
  ShieldPlus,
  ShieldMinus,
  X,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

// ── Event type definitions ────────────────────────────────────────────────────

const TIME_EVENTS = [
  { value: "MEMBER_JOIN", label: "Member Join", icon: UserPlus },
  { value: "MEMBER_LEAVE", label: "Member Leave", icon: UserMinus },
  { value: "MEMBER_UPDATE", label: "Member Update", icon: UserPlus },
  { value: "MESSAGE_SENT", label: "Message Sent", icon: MessageSquare },
  { value: "MESSAGE_REACTION_ADD", label: "Reaction Added", icon: CircleDot },
  { value: "VOICE_JOIN", label: "Voice Join", icon: Headphones },
  { value: "VOICE_LEAVE", label: "Voice Leave", icon: Headphones },
  { value: "ROLE_ASSIGNED", label: "Role Assigned", icon: ShieldPlus },
  { value: "ROLE_REMOVED", label: "Role Removed", icon: ShieldMinus },
  { value: "CHANNEL_CREATED", label: "Channel Created", icon: MessageSquare },
  { value: "CHANNEL_DELETED", label: "Channel Deleted", icon: X },
] as const;

const PRESET_SCHEDULES = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every day at 9 AM", value: "0 9 * * *" },
  { label: "Every Monday at 9 AM", value: "0 9 * * 1" },
  { label: "First of month", value: "0 0 1 * *" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function TriggerBadge({ triggerType, eventType }: { triggerType: string; eventType?: string }) {
  if (triggerType === "EVENT") {
    const event = TIME_EVENTS.find((e) => e.value === eventType);
    const Icon = event?.icon ?? Zap;
    return (
      <Badge className="bg-[#5865F2]/20 text-[#7289DA] border border-[#5865F2]/30 gap-1.5 flex items-center w-fit">
        <Icon className="h-3 w-3" />
        {event?.label ?? eventType}
      </Badge>
    );
  }
  return (
    <Badge className="bg-[#43B581]/20 text-[#43B581] border border-[#43B581]/30 gap-1.5 flex items-center w-fit">
      <Clock className="h-3 w-3" />
      Time-based
    </Badge>
  );
}

// ── Create/Edit Modal ──────────────────────────────────────────────────────────

interface ScheduleModalProps {
  serverId: string;
  editing?: ScheduledSequence | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}

function ScheduleModal({ serverId, editing, open, onOpenChange, onSuccess }: ScheduleModalProps) {
  const [activeTab, setActiveTab] = useState<"TIME" | "EVENT">(editing?.trigger_type ?? "TIME");
  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [cronExpression, setCronExpression] = useState(editing?.cron_expression ?? "");
  const [timezone, setTimezone] = useState(editing?.timezone ?? "UTC");
  const [eventType, setEventType] = useState(editing?.event_type ?? "");
  const [actionSequenceId, setActionSequenceId] = useState(editing?.action_sequence_id ?? "");
  const [maxRuns, setMaxRuns] = useState(editing?.max_runs?.toString() ?? "");
  const [cronError, setCronError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const create = useCreateScheduledSequence(serverId);
  const update = useUpdateScheduledSequence(serverId, editing?.id ?? "");
  const validateCron = useValidateCron();

  const isTime = activeTab === "TIME";

  function reset() {
    setName("");
    setDescription("");
    setCronExpression("");
    setTimezone("UTC");
    setEventType("");
    setActionSequenceId("");
    setMaxRuns("");
    setCronError(null);
    setActiveTab("TIME");
  }

  function handleOpenChange(v: boolean) {
    if (!v) reset();
    onOpenChange(v);
  }

  async function handlePresetClick(expr: string) {
    setCronExpression(expr);
    setCronError(null);
    try {
      const result = await validateCron.mutateAsync({ cronExpression: expr, timezone });
      if (!result.valid) setCronError("Invalid preset");
    } catch {
      setCronError("Invalid preset");
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setCronError(null);

    // Validate
    if (!name.trim()) {
      setIsSubmitting(false);
      return;
    }
    if (!actionSequenceId.trim()) {
      setIsSubmitting(false);
      return;
    }
    if (isTime && !cronExpression.trim()) {
      setCronError("Cron expression is required");
      setIsSubmitting(false);
      return;
    }
    if (isTime) {
      try {
        const result = await validateCron.mutateAsync({ cronExpression: cronExpression.trim(), timezone });
        if (!result.valid) {
          setCronError("Invalid cron expression");
          setIsSubmitting(false);
          return;
        }
      } catch {
        setCronError("Could not validate cron expression");
        setIsSubmitting(false);
        return;
      }
    }

    const payload: CreateScheduledSequencePayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      trigger_type: activeTab,
      action_sequence_id: actionSequenceId.trim(),
      timezone,
    };

    if (isTime) {
      payload.cron_expression = cronExpression.trim();
    } else {
      payload.event_type = eventType;
    }

    if (maxRuns.trim()) {
      payload.max_runs = parseInt(maxRuns.trim(), 10);
    }

    try {
      if (editing) {
        await update.mutateAsync(payload as unknown as Parameters<typeof update.mutateAsync>[0]);
      } else {
        await create.mutateAsync(payload);
      }
      handleOpenChange(false);
      onSuccess();
    } catch (e) {
      // Error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <DiscordModal
      open={open}
      onOpenChange={handleOpenChange}
      title={editing ? "Edit Schedule" : "Create Schedule"}
      subtitle="Automate actions with time-based or event-based triggers"
      size="lg"
      footer={
        <>
          <DiscordButton variant="secondary" onClick={() => handleOpenChange(false)}>
            Cancel
          </DiscordButton>
          <DiscordButton
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim() || !actionSequenceId.trim() || (isTime && !cronExpression.trim())}
          >
            {isSubmitting ? "Saving…" : editing ? "Save Changes" : "Create Schedule"}
          </DiscordButton>
        </>
      }
    >
      {/* Tab Selector */}
      <div className="flex gap-1 bg-[#2B2D31] rounded-[4px] p-1 mb-5">
        <button
          type="button"
          onClick={() => { setActiveTab("TIME"); setCronError(null); }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-[3px] text-sm font-medium transition-all outline-none",
            activeTab === "TIME"
              ? "bg-[#5865F2] text-white"
              : "text-[#B5BAC1] hover:text-white hover:bg-[#3C3F45]"
          )}
        >
          <Clock className="h-4 w-4" />
          Time-based
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("EVENT")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 rounded-[3px] text-sm font-medium transition-all outline-none",
            activeTab === "EVENT"
              ? "bg-[#5865F2] text-white"
              : "text-[#B5BAC1] hover:text-white hover:bg-[#3C3F45]"
          )}
        >
          <Zap className="h-4 w-4" />
          Event-based
        </button>
      </div>

      {/* Name */}
      <DiscordField label="Schedule Name" required>
        <DiscordInput
          placeholder="e.g. Welcome New Members"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DiscordField>

      {/* Description */}
      <DiscordField label="Description">
        <DiscordTextarea
          placeholder="Optional description for this schedule"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[60px]"
        />
      </DiscordField>

      {/* TIME TAB */}
      {isTime && (
        <>
          <DiscordField label="Cron Expression" required helperText="minute hour day month weekday">
            <DiscordInput
              placeholder="0 9 * * *"
              value={cronExpression}
              onChange={(e) => { setCronExpression(e.target.value); setCronError(null); }}
              className="font-mono"
            />
            {cronError && <p className="text-xs text-[#F23F42] mt-1.5">{cronError}</p>}
          </DiscordField>

          {/* Preset schedules */}
          <div className="mb-5">
            <p className="text-xs font-bold text-[#B5BAC1] uppercase tracking-wide mb-2">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_SCHEDULES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handlePresetClick(p.value)}
                  className="px-2.5 py-1 rounded-[3px] bg-[#4E5058] hover:bg-[#6D6F78] text-xs text-[#DBDEE1] transition-colors outline-none"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <DiscordField label="Timezone">
            <DiscordInput
              placeholder="UTC"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
          </DiscordField>
        </>
      )}

      {/* EVENT TAB */}
      {!isTime && (
        <>
          <DiscordField label="Discord Event" required helperText="Which event triggers this sequence?">
            <div className="grid grid-cols-2 gap-2">
              {TIME_EVENTS.map((e) => {
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
        </>
      )}

      {/* Action Sequence ID */}
      <DiscordField label="Action Sequence ID" required helperText="The ID of the action sequence to execute">
        <DiscordInput
          placeholder="uuid of your action sequence"
          value={actionSequenceId}
          onChange={(e) => setActionSequenceId(e.target.value)}
          className="font-mono text-xs"
        />
      </DiscordField>

      {/* Max Runs */}
      <DiscordField label="Max Runs (Optional)">
        <DiscordInput
          type="number"
          placeholder="Unlimited"
          value={maxRuns}
          onChange={(e) => setMaxRuns(e.target.value)}
        />
      </DiscordField>
    </DiscordModal>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ScheduledSequencesPage() {
  const params = useParams();
  const serverId = params.serverId as string;
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSequence, setEditingSequence] = useState<ScheduledSequence | null>(null);

  const { data: sequences, isLoading } = useScheduledSequences(serverId);
  const deleteSequence = useDeleteScheduledSequence(serverId);
  const queryClient = useQueryClient();

  const handleEdit = (seq: ScheduledSequence) => {
    setEditingSequence(seq);
    setIsCreateOpen(true);
  };

  const handleDelete = async (seqId: string) => {
    if (!confirm("Delete this schedule? This cannot be undone.")) return;
    try {
      await deleteSequence.mutateAsync(seqId);
      toast({ title: "Schedule deleted" });
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  const handleExecute = async (seqId: string) => {
    try {
      await api.scheduledSequences.execute(serverId, seqId);
      queryClient.invalidateQueries({ queryKey: ["servers", serverId, "scheduled-sequences"] });
      toast({ title: "Sequence executed" });
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to execute",
        variant: "destructive",
      });
    }
  };

  const handleModalSuccess = () => {
    setEditingSequence(null);
    setIsCreateOpen(false);
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-7 w-7 text-[#7289DA]" />
            Schedules
          </h1>
          <p className="text-[#B5BAC1] mt-1">
            Automate action sequences with time-based or event-based triggers.
          </p>
        </div>
        <Button
          onClick={() => { setEditingSequence(null); setIsCreateOpen(true); }}
          className="bg-[#5865F2] hover:bg-[#4752C4]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Schedule
        </Button>
      </div>

      {/* Empty State */}
      {isLoading ? null : !sequences?.length ? (
        <div className="rounded-[4px] bg-[#2B2D31] border border-[#3C3F45] p-16 text-center">
          <Clock className="mx-auto h-12 w-12 text-[#80848E] mb-4" />
          <h3 className="text-lg font-semibold text-white mb-1">No schedules yet</h3>
          <p className="text-sm text-[#B5BAC1] mb-6">
            Create your first schedule to automate actions on your server.
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#5865F2] hover:bg-[#4752C4]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Schedule
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sequences.map((seq) => (
            <Card
              key={seq.id}
              className="bg-[#2B2D31] border-[#3C3F45] text-white hover:border-[#5865F2]/50 transition-colors"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#5865F2]/20 flex items-center justify-center flex-shrink-0">
                      {seq.trigger_type === "EVENT" ? (
                        <Zap className="h-5 w-5 text-[#7289DA]" />
                      ) : (
                        <Clock className="h-5 w-5 text-[#7289DA]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{seq.name}</CardTitle>
                      {seq.description && (
                        <CardDescription className="text-[#B5BAC1] text-xs mt-0.5 line-clamp-1">
                          {seq.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <TriggerBadge triggerType={seq.trigger_type} eventType={seq.event_type} />
                    {seq.is_active ? (
                      <Badge className="bg-[#43B581]/20 text-[#43B581] border border-[#43B581]/30 text-xs">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Paused
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Trigger info */}
                {seq.trigger_type === "TIME" ? (
                  <div className="flex items-center gap-2 p-3 bg-[#1E1F22] rounded-[3px]">
                    <code className="text-sm font-mono text-[#DBDEE1]">{seq.cron_expression}</code>
                    <span className="text-[#80848E] text-xs">({seq.timezone})</span>
                  </div>
                ) : null}

                {/* Stats row */}
                <div className="flex items-center gap-6 text-xs text-[#B5BAC1]">
                  <div>
                    <span className="text-[#80848E]">Runs: </span>
                    <span className="text-white">{seq.run_count}</span>
                    {seq.max_runs && <span className="text-[#80848E]"> / {seq.max_runs}</span>}
                  </div>
                  <div>
                    <span className="text-[#80848E]">Last: </span>
                    {seq.last_run_at ? (
                      <span className="text-white">{formatDistanceToNow(new Date(seq.last_run_at), { addSuffix: true })}</span>
                    ) : (
                      <span className="text-[#80848E]">Never</span>
                    )}
                  </div>
                  {seq.next_run_at && seq.is_active && (
                    <div>
                      <span className="text-[#80848E]">Next: </span>
                      <span className="text-white">{format(new Date(seq.next_run_at), "MMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#3C3F45]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExecute(seq.id)}
                    className="text-[#B5BAC1] hover:text-white hover:bg-[#3C3F45] gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5" />
                    Run now
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(seq)}
                    className="text-[#B5BAC1] hover:text-white hover:bg-[#3C3F45] gap-1.5"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(seq.id)}
                    disabled={deleteSequence.isPending}
                    className="text-[#F23F42] hover:bg-[#F23F42]/10 hover:text-[#F23F42] gap-1.5 ml-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <ScheduleModal
        serverId={serverId}
        editing={editingSequence}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
