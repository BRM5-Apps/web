"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

const qk = {
  list: (serverId: string) => ["elements", serverId] as const,
};

export function useElements(serverId: string) {
  return useQuery({
    queryKey: qk.list(serverId),
    queryFn: () => api.elements.list(serverId),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(serverId),
  });
}

export function useResolveElements(serverId: string) {
  return useMutation({
    mutationFn: (input: string) => api.elements.resolve(serverId, input),
    onError: () => toast.error("Failed to resolve element tokens"),
  });
}

export function useCreateElement(serverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.elements.create(serverId, data),
    onSuccess: () => {
      toast.success("Element created");
      qc.invalidateQueries({ queryKey: qk.list(serverId) });
    },
    onError: () => toast.error("Failed to create element"),
  });
}
