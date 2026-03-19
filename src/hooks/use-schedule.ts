"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { ScheduledMessage } from "@/types/template";

const qk = {
  list: (serverId: string) => ["servers", serverId, "schedule"] as const,
};

export function useScheduledMessages(serverId: string) {
  return useQuery({
    queryKey: qk.list(serverId),
    queryFn: () => api.schedule.list(serverId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(serverId),
  });
}

export function useCreateSchedule(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ScheduledMessage>) => api.schedule.create(serverId, data),
    onSuccess: () => {
      toast.success("Scheduled message created");
      qc.invalidateQueries({ queryKey: qk.list(serverId) });
    },
    onError: (err: unknown) => {
      toast.error(
        typeof err === "object" && err && "message" in err
          ? (err as { message: string }).message
          : "Failed to create scheduled message"
      );
    },
  });
}

export function useDeleteSchedule(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.schedule.delete(serverId, id),
    onSuccess: () => {
      toast.success("Scheduled message deleted");
      qc.invalidateQueries({ queryKey: qk.list(serverId) });
    },
    onError: () => toast.error("Failed to delete scheduled message"),
  });
}
