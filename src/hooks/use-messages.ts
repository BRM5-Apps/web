"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export function useSendMessage(factionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      channel_id?: string;
      webhook_urls?: string[];
      webhook_username?: string;
      webhook_avatar_url?: string;
      template_type: string;
      template_id: string;
    }) => api.messages.send(factionId, data),
    onSuccess: () => {
      toast.success("Message queued — delivering shortly");
      qc.invalidateQueries({
        queryKey: queryKeys.messages.history(factionId),
      });
    },
    onError: () => toast.error("Failed to queue message"),
  });
}

export function useMessageHistory(factionId: string) {
  return useQuery({
    queryKey: queryKeys.messages.history(factionId),
    queryFn: () => api.messages.history(factionId),
    enabled: Boolean(factionId),
    staleTime: 1000 * 30,
  });
}
