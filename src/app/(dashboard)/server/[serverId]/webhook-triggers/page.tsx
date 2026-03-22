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
  useWebhookTriggers,
  useCreateWebhookTrigger,
  useUpdateWebhookTrigger,
  useDeleteWebhookTrigger,
} from "@/hooks/use-webhook-triggers";
import { WebhookTrigger } from "@/types/platform-extensions";
import { Copy, Trash2, Edit, Plus, Webhook, Shield, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const webhookFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  actionSequenceId: z.string().min(1, "Action sequence is required"),
  hmacSecret: z.string().optional(),
  requireAuth: z.boolean().default(false),
  allowedIPs: z.string().optional(),
  rateLimitPerMin: z.number().min(1).max(10000).default(60),
});

type WebhookFormValues = z.infer<typeof webhookFormSchema>;

export default function WebhookTriggersPage() {
  const params = useParams();
  const serverId = params.serverId as string;
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookTrigger | null>(null);

  const { data: webhooks, isLoading } = useWebhookTriggers(serverId);
  const createWebhook = useCreateWebhookTrigger(serverId);
  const updateWebhook = useUpdateWebhookTrigger(serverId, editingWebhook?.id || "");
  const deleteWebhook = useDeleteWebhookTrigger(serverId);

  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      name: "",
      description: "",
      actionSequenceId: "",
      hmacSecret: "",
      requireAuth: false,
      allowedIPs: "",
      rateLimitPerMin: 60,
    },
  });

  const onSubmit = async (values: WebhookFormValues) => {
    try {
      const payload = {
        ...values,
        allowedIPs: values.allowedIPs?.split(",").map((ip) => ip.trim()).filter(Boolean),
      };

      if (editingWebhook) {
        await updateWebhook.mutateAsync(payload);
        toast({ title: "Success", description: "Webhook trigger updated" });
        setEditingWebhook(null);
      } else {
        await createWebhook.mutateAsync(payload);
        toast({ title: "Success", description: "Webhook trigger created" });
      }
      setIsCreateOpen(false);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save webhook",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (webhook: WebhookTrigger) => {
    setEditingWebhook(webhook);
    form.reset({
      name: webhook.name,
      description: webhook.description || "",
      actionSequenceId: webhook.actionSequenceId,
      hmacSecret: webhook.hmacSecret || "",
      requireAuth: webhook.requireAuth,
      allowedIPs: webhook.allowedIPs?.join(", ") || "",
      rateLimitPerMin: webhook.rateLimitPerMin,
    });
    setIsCreateOpen(true);
  };

  const handleDelete = async (webhookId: string) => {
    if (!confirm("Are you sure you want to delete this webhook trigger?")) return;
    try {
      await deleteWebhook.mutateAsync(webhookId);
      toast({ title: "Success", description: "Webhook trigger deleted" });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete webhook",
        variant: "destructive",
      });
    }
  };

  const copyWebhookUrl = (path: string) => {
    const url = `${window.location.origin}/api/v1/webhooks/${path}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Copied", description: "Webhook URL copied to clipboard" });
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
          <h1 className="text-3xl font-bold tracking-tight">Webhook Triggers</h1>
          <p className="text-muted-foreground">
            Create HTTP endpoints to trigger action sequences from external services
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingWebhook(null); form.reset(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingWebhook ? "Edit Webhook" : "Create Webhook"}</DialogTitle>
              <DialogDescription>
                Configure an HTTP endpoint that triggers an action sequence
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
                        <Input placeholder="My Webhook" {...field} />
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
                  name="actionSequenceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action Sequence</FormLabel>
                      <FormControl>
                        <Input placeholder="Sequence ID" {...field} />
                      </FormControl>
                      <FormDescription>The action sequence to execute when triggered</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="requireAuth"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Authentication</FormLabel>
                        <FormDescription>Require valid JWT token</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hmacSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HMAC Secret (Optional)</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Secret for signature verification" {...field} />
                      </FormControl>
                      <FormDescription>Used to verify webhook signatures</FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="allowedIPs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Allowed IPs (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="1.2.3.4, 5.6.7.8" {...field} />
                      </FormControl>
                      <FormDescription>Comma-separated list of allowed IP addresses</FormDescription>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createWebhook.isPending || updateWebhook.isPending}>
                    {editingWebhook ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {webhooks?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No webhook triggers yet</p>
              <p className="text-muted-foreground">Create your first webhook to get started</p>
            </CardContent>
          </Card>
        ) : (
          webhooks?.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    <CardTitle>{webhook.name}</CardTitle>
                    {webhook.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(webhook)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(webhook.id)}
                      disabled={deleteWebhook.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{webhook.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <code className="text-sm flex-1 truncate">
                    {typeof window !== "undefined"
                      ? `${window.location.origin}/api/v1/webhooks/${webhook.webhookPath}`
                      : `/api/v1/webhooks/${webhook.webhookPath}`}
                  </code>
                  <Button variant="ghost" size="sm" onClick={() => copyWebhookUrl(webhook.webhookPath)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span>{webhook.requireAuth ? "Auth required" : "No auth"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{webhook.rateLimitPerMin}/min rate limit</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Created {formatDistanceToNow(new Date(webhook.createdAt))} ago
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
