"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export function useSendMessage(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      channel_id?: string;
      webhook_urls?: string[];
      webhook_username?: string;
      webhook_avatar_url?: string;
      template_type: string;
      template_id: string;
    }) => api.messages.send(serverId, data),
    onSuccess: () => {
      toast.success("Message queued — delivering shortly");
      qc.invalidateQueries({
        queryKey: queryKeys.messages.history(serverId),
      });
    },
    onError: () => toast.error("Failed to queue message"),
  });
}

export function useQuickSend(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      channel_id?: string;
      webhook_urls?: string[];
      webhook_username?: string;
      webhook_avatar_url?: string;
      message_type: string;
      content: unknown;
    }) => api.messages.quickSend(serverId, data),
    onSuccess: () => {
      toast.success("Message sent successfully");
      qc.invalidateQueries({
        queryKey: queryKeys.messages.history(serverId),
      });
    },
    onError: () => toast.error("Failed to send message"),
  });
}

export function useMessageHistory(serverId: string) {
  return useQuery({
    queryKey: queryKeys.messages.history(serverId),
    queryFn: () => api.messages.history(serverId),
    enabled: Boolean(serverId),
    staleTime: 1000 * 30,
    retry: false,
  });
}
