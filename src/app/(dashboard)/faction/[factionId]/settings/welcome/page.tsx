"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

interface WelcomeConfig {
  id?: string;
  enabled: boolean;
  channel_id: string;
  message_text: string;
  assign_rank_id?: string | null;
  embed_template_id?: string | null;
}

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  enabled: z.boolean(),
  channel_id: z.string(),
  message_text: z.string(),
});

type FormData = z.infer<typeof schema>;

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useWelcomeConfig(factionId: string) {
  return useQuery<WelcomeConfig>({
    queryKey: queryKeys.config.welcome(factionId),
    queryFn: ({ signal }) => api.config.getWelcome(factionId, { signal }) as Promise<WelcomeConfig>,
    enabled: !!factionId,
  });
}

function useUpdateWelcomeConfig(factionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<WelcomeConfig>) => api.config.updateWelcome(factionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.config.welcome(factionId) });
    },
  });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WelcomeSettingsPage() {
  const params = useParams<{ factionId: string }>();
  const factionId = params.factionId;
  const { data: config, isLoading } = useWelcomeConfig(factionId);
  const updateMutation = useUpdateWelcomeConfig(factionId);

  const { register, handleSubmit, reset, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { enabled: false, channel_id: "", message_text: "" },
  });

  const enabled = watch("enabled");

  useEffect(() => {
    if (config) {
      reset({
        enabled: config.enabled,
        channel_id: config.channel_id ?? "",
        message_text: config.message_text ?? "",
      });
    }
  }, [config, reset]);

  function onSubmit(data: FormData) {
    updateMutation.mutate(data, {
      onSuccess: () => toast.success("Welcome settings saved"),
      onError: () => toast.error("Failed to save settings"),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome & Goodbye</h1>
          <p className="text-muted-foreground">Automated messages when members join or leave.</p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome & Goodbye</h1>
        <p className="text-muted-foreground">
          Configure automated messages when members join or leave your server.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome Message</CardTitle>
            <CardDescription>
              Sent to the specified channel when a member joins.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enabled">Enable welcome messages</Label>
              <Switch
                id="enabled"
                checked={enabled}
                onCheckedChange={(v) => setValue("enabled", v)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="channel_id">Discord Channel ID</Label>
              <Input
                id="channel_id"
                placeholder="123456789012345678"
                {...register("channel_id")}
              />
              <p className="text-xs text-muted-foreground">
                Right-click a channel in Discord and copy its ID.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message_text">Message Text</Label>
              <textarea
                id="message_text"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Welcome {{username}} to {{faction_name}}!"
                {...register("message_text")}
              />
              <p className="text-xs text-muted-foreground">
                Available variables: <code>{"{{username}}"}</code>, <code>{"{{faction_name}}"}</code>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
