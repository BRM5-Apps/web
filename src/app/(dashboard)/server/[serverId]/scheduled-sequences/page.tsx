"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useScheduledSequences,
  useCreateScheduledSequence,
  useUpdateScheduledSequence,
  useDeleteScheduledSequence,
  useExecuteScheduledSequence,
  useValidateCron,
} from "@/hooks/use-scheduled-sequences";
import { ScheduledSequence } from "@/types/platform-extensions";
import { Clock, Trash2, Edit, Plus, Play, Calendar, History } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const scheduledSequenceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  cronExpression: z.string().min(1, "Cron expression is required"),
  timezone: z.string().default("UTC"),
  actionSequenceId: z.string().min(1, "Action sequence is required"),
  maxRuns: z.number().optional(),
});

type ScheduledSequenceFormValues = z.infer<typeof scheduledSequenceSchema>;

export default function ScheduledSequencesPage() {
  const params = useParams();
  const serverId = params.serverId as string;
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSequence, setEditingSequence] = useState<ScheduledSequence | null>(null);

  const { data: sequences, isLoading } = useScheduledSequences(serverId);
  const createSequence = useCreateScheduledSequence(serverId);
  const updateSequence = useUpdateScheduledSequence(serverId, editingSequence?.id || "");
  const deleteSequence = useDeleteScheduledSequence(serverId);
  const executeSequence = useExecuteScheduledSequence(serverId, editingSequence?.id || "");
  const validateCron = useValidateCron();

  const form = useForm<ScheduledSequenceFormValues>({
    resolver: zodResolver(scheduledSequenceSchema),
    defaultValues: {
      name: "",
      description: "",
      cronExpression: "",
      timezone: "UTC",
      actionSequenceId: "",
      maxRuns: undefined,
    },
  });

  const onSubmit = async (values: ScheduledSequenceFormValues) => {
    try {
      // Validate cron first
      const validation = await validateCron.mutateAsync({
        cronExpression: values.cronExpression,
        timezone: values.timezone,
      });

      if (!validation.valid) {
        toast({
          title: "Invalid Cron Expression",
          description: "Please check your cron expression and try again",
          variant: "destructive",
        });
        return;
      }

      if (editingSequence) {
        await updateSequence.mutateAsync(values);
        toast({ title: "Success", description: "Scheduled sequence updated" });
        setEditingSequence(null);
      } else {
        await createSequence.mutateAsync(values);
        toast({ title: "Success", description: "Scheduled sequence created" });
      }
      setIsCreateOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save sequence",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (sequence: ScheduledSequence) => {
    setEditingSequence(sequence);
    form.reset({
      name: sequence.name,
      description: sequence.description || "",
      cronExpression: sequence.cronExpression,
      timezone: sequence.timezone,
      actionSequenceId: sequence.actionSequenceId,
      maxRuns: sequence.maxRuns || undefined,
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (sequenceId: string) => {
    if (!confirm("Are you sure you want to delete this scheduled sequence?")) return;
    try {
      await deleteSequence.mutateAsync(sequenceId);
      toast({ title: "Success", description: "Scheduled sequence deleted" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete sequence",
        variant: "destructive",
      });
    }
  };

  const handleExecute = async (sequenceId: string) => {
    try {
      await executeSequence.mutateAsync();
      toast({ title: "Success", description: "Sequence executed manually" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to execute sequence",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scheduled Sequences</h1>
          <p className="text-muted-foreground">
            Automate action sequences with cron-based scheduling
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingSequence(null); form.reset(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingSequence ? "Edit Schedule" : "Create Schedule"}</DialogTitle>
              <DialogDescription>
                Configure a cron schedule for your action sequence
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Daily Report" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Optional description" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cronExpression"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cron Expression</FormLabel>
                      <FormControl>
                        <Input placeholder="0 9 * * *" {...field} />
                      </FormControl>
                      <FormDescription>
                        Example: "0 9 * * *" for daily at 9 AM
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timezone</FormLabel>
                      <FormControl>
                        <Input placeholder="UTC" {...field} />
                      </FormControl>
                      <FormDescription>Example: America/New_York</FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="actionSequenceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action Sequence</FormLabel>
                      <FormControl>
                        <Input placeholder="Sequence ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxRuns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Runs (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Unlimited"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Maximum number of executions</FormDescription>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={createSequence.isPending || updateSequence.isPending || validateCron.isPending}
                  >
                    {editingSequence ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {sequences?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No scheduled sequences yet</p>
              <p className="text-muted-foreground">Create your first scheduled sequence</p>
            </CardContent>
          </Card>
        ) : (
          sequences?.map((sequence) => (
            <Card key={sequence.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <CardTitle>{sequence.name}</CardTitle>
                    {sequence.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleExecute(sequence.id)}
                      disabled={executeSequence.isPending}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(sequence)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(sequence.id)}
                      disabled={deleteSequence.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{sequence.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <code className="text-sm font-mono">{sequence.cronExpression}</code>
                  <span className="text-muted-foreground">({sequence.timezone})</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Run count: </span>
                    <span>{sequence.runCount}</span>
                    {sequence.maxRuns && <span> / {sequence.maxRuns}</span>}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last run: </span>
                    <span>
                      {sequence.lastRunAt
                        ? formatDistanceToNow(new Date(sequence.lastRunAt)) + " ago"
                        : "Never"}
                    </span>
                  </div>
                </div>

                {sequence.nextRunAt && sequence.isActive && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Next run: </span>
                    <span>{format(new Date(sequence.nextRunAt), "PPp")}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
