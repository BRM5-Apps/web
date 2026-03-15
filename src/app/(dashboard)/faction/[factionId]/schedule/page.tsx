"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useScheduledMessages, useCreateSchedule, useDeleteSchedule } from "@/hooks/use-schedule";
import { useAllTemplates } from "@/hooks/use-templates";
import type { ScheduledMessage } from "@/types/template";

type TemplateType = "embed" | "text" | "container";

const REPEAT_OPTIONS = [
  { value: "none", label: "None (one-time)" },
  { value: "1 hour", label: "Every hour" },
  { value: "1 day", label: "Every day" },
  { value: "1 week", label: "Every week" },
  { value: "1 month", label: "Every month" },
];

function CreateScheduleDialog({
  factionId,
  open,
  onOpenChange,
}: {
  factionId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [templateType, setTemplateType] = useState<TemplateType>("embed");
  const [templateId, setTemplateId] = useState("");
  const [channelId, setChannelId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [repeatInterval, setRepeatInterval] = useState("none");

  const { embeds, containers, texts, isLoading: templatesLoading } = useAllTemplates(factionId);
  const create = useCreateSchedule(factionId);

  const templateOptions =
    templateType === "embed" ? embeds : templateType === "container" ? containers : texts;

  function handleSubmit() {
    if (!templateId || !channelId || !scheduledAt) return;
    const payload: Partial<ScheduledMessage> = {
      channelId,
      scheduledAt: new Date(scheduledAt).toISOString(),
      repeatInterval: repeatInterval && repeatInterval !== "none" ? repeatInterval : undefined,
      ...(templateType === "embed" && { embedTemplateId: templateId }),
      ...(templateType === "text" && { textTemplateId: templateId }),
      ...(templateType === "container" && { containerTemplateId: templateId }),
    };
    create.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false);
        setTemplateId("");
        setChannelId("");
        setScheduledAt("");
        setRepeatInterval("none");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Scheduled Message</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Template Type</Label>
            <div className="flex gap-2">
              {(["embed", "text", "container"] as TemplateType[]).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={templateType === t ? "default" : "outline"}
                  onClick={() => { setTemplateType(t); setTemplateId(""); }}
                  className="capitalize"
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Template</Label>
            {templatesLoading ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template…" />
                </SelectTrigger>
                <SelectContent>
                  {templateOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Channel ID</Label>
            <Input
              placeholder="Discord channel ID"
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Send At</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Repeat</Label>
            <Select value={repeatInterval} onValueChange={setRepeatInterval}>
              <SelectTrigger>
                <SelectValue placeholder="No repeat" />
              </SelectTrigger>
              <SelectContent>
                {REPEAT_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!templateId || !channelId || !scheduledAt || create.isPending}
          >
            {create.isPending ? "Saving…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SchedulePage() {
  const { factionId } = useParams<{ factionId: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: scheduled, isLoading } = useScheduledMessages(factionId);
  const deleteSchedule = useDeleteSchedule(factionId);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-7 w-7 text-muted-foreground" />
            Scheduled Messages
          </h1>
          <p className="text-muted-foreground mt-1">
            Automate message delivery to Discord channels on a schedule.
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Schedule
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : !scheduled?.length ? (
        <div className="rounded-md border py-16 text-center">
          <Clock className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No scheduled messages yet.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setDialogOpen(true)}>
            Create one
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Send At</TableHead>
                <TableHead>Repeat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduled.map((s) => {
                const type = s.embedTemplateId
                  ? "embed"
                  : s.textTemplateId
                  ? "text"
                  : "container";
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">{type}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{s.channelId}</TableCell>
                    <TableCell>{new Date(s.scheduledAt).toLocaleString()}</TableCell>
                    <TableCell>{s.repeatInterval || "One-time"}</TableCell>
                    <TableCell>
                      {s.isActive ? (
                        <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-muted-foreground">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        disabled={deleteSchedule.isPending}
                        onClick={() => deleteSchedule.mutate(s.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateScheduleDialog
        factionId={factionId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
