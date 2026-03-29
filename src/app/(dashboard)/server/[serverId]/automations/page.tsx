"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useScheduledSequences,
  useCreateScheduledSequence,
  useDeleteScheduledSequence,
  useDuplicateScheduledSequence,
} from "@/hooks/use-scheduled-sequences";
import type { ScheduledSequence } from "@/types/platform-extensions";
import { AutomationWorkbench, MiniFlowViz } from "@/components/automation-workbench";
import { formatDistanceToNow, format } from "date-fns";
import {
  Clock,
  Plus,
  Trash2,
  Zap,
  Play,
  Copy,
  UserPlus,
  UserMinus,
  MessageSquare,
  CircleDot,
  Headphones,
  ShieldPlus,
  ShieldMinus,
  GitBranch,
} from "lucide-react";

// ── Event type definitions ────────────────────────────────────────────────────

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
  { label: "Every minute", value: "* * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every day at 9 AM", value: "0 9 * * *" },
  { label: "Every Monday at 9 AM", value: "0 9 * * 1" },
  { label: "First of month", value: "0 0 1 * *" },
];

// ── Trigger Badge ───────────────────────────────────────────────────────────

function TriggerBadge({ triggerType, eventType }: { triggerType: string; eventType?: string }) {
  if (triggerType === "EVENT") {
    const found = DISCORD_EVENTS.find((e) => e.value === eventType);
    const Icon = found?.icon ?? Zap;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#5865F2]/20 text-[#7289DA] text-xs border border-[#5865F2]/30">
        <Icon className="h-3 w-3" />
        {found?.label ?? eventType}
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

// ── Automation Card ─────────────────────────────────────────────────────────

function AutomationCard({
  sequence,
  onDelete,
  onDuplicate,
  isDeleting,
  isDuplicating,
}: {
  sequence: ScheduledSequence;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  isDeleting: boolean;
  isDuplicating: boolean;
}) {
  if (!sequence) return null;

  return (
    <div className="rounded-[4px] border border-[#3C3F45] bg-[#2B2D31] p-4 hover:border-[#5865F2]/40 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-full bg-[#313338] flex items-center justify-center flex-shrink-0 mt-0.5">
            {sequence.trigger_type === "EVENT" ? (
              <Zap className="h-4 w-4 text-[#7289DA]" />
            ) : (
              <Clock className="h-4 w-4 text-[#7289DA]" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white truncate">{sequence.name}</span>
              <TriggerBadge triggerType={sequence.trigger_type} eventType={sequence.event_type} />
              {sequence.is_active ? (
                <Badge className="bg-[#43B581]/20 text-[#43B581] border border-[#43B581]/30 text-xs">Active</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs text-[#80848E]">Paused</Badge>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-[#80848E]">
              {sequence.cron_expression && (
                <span className="font-mono text-[10px]">{sequence.cron_expression}</span>
              )}
              <span>Runs: {sequence.run_count}</span>
              {sequence.last_run_at && (
                <span>Last: {formatDistanceToNow(new Date(sequence.last_run_at))} ago</span>
              )}
              {sequence.next_run_at && (
                <span>Next: {format(new Date(sequence.next_run_at), "MMM d, h:mm a")}</span>
              )}
            </div>
            {/* Mini flow viz */}
            <div className="mt-2">
              <MiniFlowViz
                triggerType={sequence.trigger_type as "TIME" | "EVENT"}
                eventType={sequence.event_type}
                cronExpression={sequence.cron_expression}
                compact
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-[#80848E] hover:text-white"
            title="Run now"
          >
            <Play className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-[#80848E] hover:text-[#7289DA]"
            onClick={() => onDuplicate(sequence.id)}
            disabled={isDuplicating}
            title="Duplicate"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-[#80848E] hover:text-[#F23F42]"
            onClick={() => onDelete(sequence.id)}
            disabled={isDeleting}
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-[4px] border border-dashed border-[#3C3F45] py-16 text-center">
      <GitBranch className="mx-auto h-8 w-8 text-[#80848E] mb-3" />
      <p className="text-sm text-[#80848E] mb-1">No automations yet.</p>
      <p className="text-xs text-[#6D6F78] mb-5">
        Build workflows with time-based or event-based triggers.
      </p>
      <Button
        onClick={onCreate}
        size="sm"
        className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        New Automation
      </Button>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function AutomationsPage() {
  const { serverId } = useParams<{ serverId: string }>();
  const [workbenchOpen, setWorkbenchOpen] = useState(false);
  const { toast } = useToast();

  const { data: sequences, isLoading } = useScheduledSequences(serverId);
  const deleteSequence = useDeleteScheduledSequence(serverId);
  const duplicateSequence = useDuplicateScheduledSequence(serverId);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this automation?")) return;
    try {
      await deleteSequence.mutateAsync(id);
      toast({ title: "Automation deleted" });
    } catch {
      toast({ title: "Failed to delete automation", variant: "destructive" });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateSequence.mutateAsync(id);
      toast({ title: "Automation duplicated" });
    } catch {
      toast({ title: "Failed to duplicate automation", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="space-y-5 max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-[#7289DA]" />
              Automations
            </h1>
            <p className="text-sm text-[#80848E] mt-0.5">
              Visual workflow editor for time-based and event-driven automations.
            </p>
          </div>
          {sequences && sequences.length > 0 && (
            <Button
              onClick={() => setWorkbenchOpen(true)}
              size="sm"
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white shrink-0"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              New Automation
            </Button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-[4px]" />
            ))}
          </div>
        )}

        {/* Automation list */}
        {!isLoading && sequences && sequences.length > 0 && (
          <div className="space-y-3">
            {sequences.map((seq) => (
              <AutomationCard
                key={seq.id}
                sequence={seq}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                isDeleting={deleteSequence.isPending}
                isDuplicating={duplicateSequence.isPending}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !sequences?.length && (
          <EmptyState onCreate={() => setWorkbenchOpen(true)} />
        )}
      </div>

      {/* Automation Workbench */}
      <AutomationWorkbench
        open={workbenchOpen}
        onOpenChange={setWorkbenchOpen}
        serverId={serverId}
      />
    </>
  );
}
