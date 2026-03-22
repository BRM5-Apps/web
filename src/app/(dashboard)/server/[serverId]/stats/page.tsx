"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Users2,
  TrendingUp,
  Calendar,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Trophy,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { useStats } from "@/hooks/use-stats";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { LeaderboardEntry } from "@/types/stats";

interface StatCardProps {
  title: string;
  value: number | undefined;
  icon: React.ReactNode;
  isLoading: boolean;
}

function StatCard({ title, value, icon, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-2xl font-bold">
            {value !== undefined ? value.toLocaleString() : "—"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function StatCardsLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function LeaderboardLoading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="ml-auto h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <AlertCircle className="h-10 w-10 text-destructive" />
      <div>
        <p className="font-medium">Failed to load data</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  );
}

function getInitials(username: string): string {
  return username
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export default function StatsPage() {
  const { serverId } = useParams<{ serverId: string }>();

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorObj,
    refetch: refetchStats,
  } = useStats(serverId);

  const {
    data: leaderboard,
    isLoading: leaderboardLoading,
    isError: leaderboardError,
    error: leaderboardErrorObj,
    refetch: refetchLeaderboard,
  } = useQuery<LeaderboardEntry[]>({
    queryKey: queryKeys.stats.leaderboard(serverId),
    queryFn: ({ signal }) =>
      api.stats.leaderboard(serverId, undefined, { signal }),
    enabled: !!serverId,
    staleTime: 5 * 60 * 1000,
  });

  const topEntries = leaderboard?.slice(0, 10);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Analytics & Stats
        </h1>
        <p className="text-muted-foreground">
          View server analytics, trends, and performance metrics.
        </p>
      </div>

      {/* Stat Cards */}
      {statsError ? (
        <ErrorState
          message={
            statsErrorObj instanceof Error
              ? statsErrorObj.message
              : "Could not load server statistics."
          }
          onRetry={() => refetchStats()}
        />
      ) : statsLoading ? (
        <StatCardsLoading />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Members"
            value={stats?.totalMembers}
            icon={<Users2 className="h-4 w-4 text-blue-500" />}
            isLoading={false}
          />
          <StatCard
            title="Active Members"
            value={stats?.activeMembers}
            icon={<TrendingUp className="h-4 w-4 text-green-500" />}
            isLoading={false}
          />
          <StatCard
            title="Total Events"
            value={stats?.totalEvents}
            icon={<Calendar className="h-4 w-4 text-purple-500" />}
            isLoading={false}
          />
          <StatCard
            title="Total Messages"
            value={stats?.totalMessages}
            icon={<MessageSquare className="h-4 w-4 text-indigo-500" />}
            isLoading={false}
          />
        </div>
      )}

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
          <CardDescription>Top members ranked by points.</CardDescription>
        </CardHeader>
        <CardContent>
          {leaderboardError ? (
            <ErrorState
              message={
                leaderboardErrorObj instanceof Error
                  ? leaderboardErrorObj.message
                  : "Could not load leaderboard data."
              }
              onRetry={() => refetchLeaderboard()}
            />
          ) : leaderboardLoading ? (
            <LeaderboardLoading />
          ) : !topEntries || topEntries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No leaderboard data available yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Member</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topEntries.map((entry) => (
                    <TableRow key={entry.userId}>
                      <TableCell className="font-medium">
                        #{entry.rank}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {entry.avatarUrl ? (
                              <AvatarImage
                                src={entry.avatarUrl}
                                alt={entry.username}
                              />
                            ) : null}
                            <AvatarFallback>
                              {getInitials(entry.username)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {entry.username}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {entry.points.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
