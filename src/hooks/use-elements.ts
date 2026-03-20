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
    queryFn: async () => {
      const elements = await api.elements.list(serverId);
      // Deduplicate by variable_key, keeping the first occurrence
      // This handles cases where multiple modals have the same name
      const seen = new Set<string>();
      const duplicates: string[] = [];
      const unique = elements.filter((el) => {
        if (seen.has(el.variable_key)) {
          duplicates.push(el.variable_key);
          return false;
        }
        seen.add(el.variable_key);
        return true;
      });

      // Warn about duplicates in development
      if (duplicates.length > 0 && process.env.NODE_ENV === "development") {
        console.warn(
          `[useElements] Found ${duplicates.length} duplicate element(s) with variable_key(s):`,
          [...new Set(duplicates)],
          "\nThis usually happens when multiple modals have the same name. Consider renaming one of the modals."
        );
      }

      return unique;
    },
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
