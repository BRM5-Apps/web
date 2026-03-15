"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/lib/api-client";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const { factionId } = useParams<{ factionId: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["factions", factionId, "stats", "leaderboard"],
    queryFn: () => api.stats.leaderboard(factionId, { limit: 25 }),
    staleTime: 1000 * 60 * 2,
    enabled: Boolean(factionId),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground">Top members ranked by activity and contributions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Member Rankings
          </CardTitle>
          <CardDescription>Members ranked by participation and achievements.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive">Failed to load leaderboard.</p>
          ) : !data?.length ? (
            <p className="text-sm text-muted-foreground">No leaderboard data yet.</p>
          ) : (
            <div className="space-y-2">
              {data.map((entry, idx) => (
                <div
                  key={entry.userId}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent/40 transition-colors"
                >
                  <span className="w-8 text-center text-sm font-bold text-muted-foreground">
                    {idx < 3 ? MEDALS[idx] : `#${idx + 1}`}
                  </span>
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={entry.avatarUrl} />
                    <AvatarFallback>{entry.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 truncate text-sm font-medium">{entry.username}</span>
                  <span className="text-sm font-semibold tabular-nums text-amber-500">
                    {entry.points.toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
