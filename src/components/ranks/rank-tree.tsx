"use client";

import { Badge } from "@/components/ui/badge";
import { Shield, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RankWithDetails } from "@/types/rank";

interface RankTreeProps {
  ranks: RankWithDetails[];
  currentUserRankId?: string;
}

export function RankTree({ ranks, currentUserRankId }: RankTreeProps) {
  // Sort by level descending (highest authority at top)
  const sorted = [...ranks].sort((a, b) => b.level - a.level);

  if (sorted.length === 0) {
    return (
      <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
        No ranks configured
      </div>
    );
  }

  return (
    <div className="rounded-md border p-4">
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">
        Rank Hierarchy
      </h3>
      <div className="space-y-0">
        {sorted.map((rank, index) => (
          <div key={rank.id} className="flex">
            {/* Connecting line */}
            <div className="flex flex-col items-center mr-3">
              <div
                className="h-3 w-3 rounded-full border-2 shrink-0"
                style={{
                  borderColor: rank.color || "#6b7280",
                  backgroundColor:
                    rank.id === currentUserRankId
                      ? rank.color || "#6b7280"
                      : "transparent",
                }}
              />
              {index < sorted.length - 1 && (
                <div className="w-px flex-1 bg-border" />
              )}
            </div>

            {/* Node content */}
            <div
              className={cn(
                "mb-2 flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm",
                rank.id === currentUserRankId && "ring-2 ring-primary bg-primary/5"
              )}
            >
              {rank.iconUrl ? (
                <img
                  src={rank.iconUrl}
                  alt={rank.name}
                  className="h-5 w-5 rounded object-cover"
                />
              ) : (
                <Shield
                  className="h-4 w-4 shrink-0"
                  style={{ color: rank.color || "#6b7280" }}
                />
              )}
              <span className="font-medium truncate">{rank.name}</span>
              <span className="text-xs text-muted-foreground">Lv.{rank.level}</span>
              <Badge variant="secondary" className="ml-auto gap-1 text-xs">
                <Users className="h-3 w-3" />
                {rank.memberCount}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
