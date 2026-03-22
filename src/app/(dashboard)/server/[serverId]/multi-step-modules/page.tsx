"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useMultiStepModules,
  useCreateMultiStepModule,
  useUpdateMultiStepModule,
  useDeleteMultiStepModule,
} from "@/hooks/use-multi-step-modules";
import { MultiStepModule } from "@/types/platform-extensions";
import { ListOrdered, Trash2, Edit, Plus, Layers, Clock, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const moduleFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  triggerType: z.enum(["command", "button", "reaction", "join", "scheduled"]).default("command"),
  triggerConfig: z.string().optional(),
  completionActionSequenceId: z.string().optional(),
  allowMultipleSessions: z.boolean().default(false),
  sessionTimeoutMinutes: z.number().min(1).max(1440).default(30),
});

type ModuleFormValues = z.infer<typeof moduleFormSchema>;

const triggerTypeLabels: Record<string, string> = {
  command: "Slash Command",
  button: "Button Click",
  reaction: "Reaction",
  join: "User Join",
  scheduled: "Scheduled",
};

export default function MultiStepModulesPage() {
  const params = useParams();
  const serverId = params.serverId as string;
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<MultiStepModule | null>(null);

  const { data: modules, isLoading } = useMultiStepModules(serverId);
  const createModule = useCreateMultiStepModule(serverId);
  const updateModule = useUpdateMultiStepModule(serverId, editingModule?.id || "");
  const deleteModule = useDeleteMultiStepModule(serverId);

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      name: "",
      description: "",
      triggerType: "command",
      triggerConfig: "",
      completionActionSequenceId: "",
      allowMultipleSessions: false,
      sessionTimeoutMinutes: 30,
    },
  });

  const onSubmit = async (values: ModuleFormValues) => {
    try {
      const payload = {
        ...values,
        triggerConfig: values.triggerConfig ? JSON.parse(values.triggerConfig) : {},
      };

      if (editingModule) {
        await updateModule.mutateAsync(payload);
        toast({ title: "Success", description: "Module updated" });
        setEditingModule(null);
      } else {
        await createModule.mutateAsync(payload);
        toast({ title: "Success", description: "Module created" });
      }
      setIsCreateOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save module",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (module: MultiStepModule) => {
    setEditingModule(module);
    form.reset({
      name: module.name,
      description: module.description || "",
      triggerType: module.triggerType as any,
      triggerConfig: JSON.stringify(module.triggerConfig || {}),
      completionActionSequenceId: module.completionActionSequenceId || "",
      allowMultipleSessions: module.allowMultipleSessions,
      sessionTimeoutMinutes: module.sessionTimeoutMinutes,
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return;
    try {
      await deleteModule.mutateAsync(moduleId);
      toast({ title: "Success", description: "Module deleted" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete module",
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
          <h1 className="text-3xl font-bold tracking-tight">Multi-Step Modules</h1>
          <p className="text-muted-foreground">
            Create wizard-style forms with multiple steps for user input
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingModule(null); form.reset(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Module
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingModule ? "Edit Module" : "Create Module"}</DialogTitle>
              <DialogDescription>
                Configure a multi-step wizard module
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
                        <Input placeholder="Registration Wizard" {...field} />
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
                  name="triggerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trigger Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trigger type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="command">Slash Command</SelectItem>
                          <SelectItem value="button">Button Click</SelectItem>
                          <SelectItem value="reaction">Reaction</SelectItem>
                          <SelectItem value="join">User Join</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="completionActionSequenceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Completion Action Sequence (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Sequence ID" {...field} />
                      </FormControl>
                      <FormDescription>Run when module is completed</FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allowMultipleSessions"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Multiple Sessions</FormLabel>
                        <FormDescription>User can have multiple active sessions</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sessionTimeoutMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Timeout (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createModule.isPending || updateModule.isPending}>
                    {editingModule ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {modules?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Layers className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No modules yet</p>
              <p className="text-muted-foreground">Create your first multi-step module</p>
            </CardContent>
          </Card>
        ) : (
          modules?.map((module) => (
            <Card key={module.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <ListOrdered className="h-5 w-5" />
                    <CardTitle>{module.name}</CardTitle>
                    {module.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(module)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(module.id)}
                      disabled={deleteModule.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{triggerTypeLabels[module.triggerType] || module.triggerType}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {module.allowMultipleSessions ? "Multiple sessions" : "Single session"}
                    </span>
                  </div>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Steps: </span>
                  <span>{module.steps?.length || 0}</span>
                </div>

                <div className="text-xs text-muted-foreground">
                  Created {formatDistanceToNow(new Date(module.createdAt))} ago
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
