"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import type { ScheduledMessage } from "@/types/template";

const qk = {
  list: (factionId: string) => ["factions", factionId, "schedule"] as const,
};

export function useScheduledMessages(factionId: string) {
  return useQuery({
    queryKey: qk.list(factionId),
    queryFn: () => api.schedule.list(factionId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(factionId),
  });
}

export function useCreateSchedule(factionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ScheduledMessage>) => api.schedule.create(factionId, data),
    onSuccess: () => {
      toast.success("Scheduled message created");
      qc.invalidateQueries({ queryKey: qk.list(factionId) });
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

export function useDeleteSchedule(factionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.schedule.delete(factionId, id),
    onSuccess: () => {
      toast.success("Scheduled message deleted");
      qc.invalidateQueries({ queryKey: qk.list(factionId) });
    },
    onError: () => toast.error("Failed to delete scheduled message"),
  });
}
