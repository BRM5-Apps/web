"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFaction } from "@/hooks/use-faction";
import { useStats } from "@/hooks/use-stats";
import { useEvents } from "@/hooks/use-events";
import { useFactionStore } from "@/stores/faction-store";
import { Loading } from "@/components/shared/loading";
import { StatsCard } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import {
  Users,
  UserCheck,
  Calendar,
  Trophy,
  Plus,
  ArrowUpRight,
  BarChart3,
} from "lucide-react";
import type { Event } from "@/types/event";

export default function FactionOverviewPage() {
  const params = useParams<{ factionId: string }>();
  const router = useRouter();
  const factionId = params.factionId;

  const { setActiveFaction, setFactionData } = useFactionStore();
  const { data: faction, isLoading: factionLoading } = useFaction(factionId);
  const { data: stats, isLoading: statsLoading } = useStats(factionId);
  const { data: events, isLoading: eventsLoading } = useEvents(factionId);

  // Sync active faction when navigating directly via URL
  useEffect(() => {
    if (faction) {
      setActiveFaction(factionId, faction);
      setFactionData(faction);
    }
  }, [faction, factionId, setActiveFaction, setFactionData]);

  if (factionLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading />
      </div>
    );
  }

  if (!faction) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Faction not found.</p>
        <Button variant="link" onClick={() => router.push("/faction")}>
          Back to factions
        </Button>
      </div>
    );
  }

  const upcomingEvents = events
    ?.filter((e) => e.status === "scheduled")
    .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{faction.name}</h1>
          {faction.description && (
            <p className="text-muted-foreground">{faction.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/faction/${factionId}/members`)}
          >
            <Users className="mr-2 h-4 w-4" />
            Members
          </Button>
          <Button onClick={() => router.push(`/faction/${factionId}/events`)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Members"
          value={stats?.totalMembers ?? 0}
          icon={Users}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Active Members"
          value={stats?.activeMembers ?? 0}
          icon={UserCheck}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Events"
          value={stats?.totalEvents ?? 0}
          icon={Calendar}
          isLoading={statsLoading}
        />
        <StatsCard
          title="Points Awarded"
          value={stats?.totalPoints ?? 0}
          icon={Trophy}
          isLoading={statsLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Upcoming Events</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/faction/${factionId}/events`)}
            >
              View all
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <EventRow key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No upcoming events
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <QuickAction
              label="Create Event"
              icon={Calendar}
              onClick={() => router.push(`/faction/${factionId}/events`)}
            />
            <QuickAction
              label="View Members"
              icon={Users}
              onClick={() => router.push(`/faction/${factionId}/members`)}
            />
            <QuickAction
              label="View Stats"
              icon={BarChart3}
              onClick={() => router.push(`/faction/${factionId}/stats`)}
            />
            <QuickAction
              label="Manage Ranks"
              icon={Trophy}
              onClick={() => router.push(`/faction/${factionId}/ranks`)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EventRow({ event }: { event: Event }) {
  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-500/10 text-blue-500",
    active: "bg-emerald-500/10 text-emerald-500",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-red-500/10 text-red-500",
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
        <Calendar className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{event.title}</p>
        <p className="text-xs text-muted-foreground">
          {formatDate(event.scheduledStart, "MMM d, h:mm a")}
        </p>
      </div>
      <Badge variant="outline" className={statusColors[event.status]}>
        {event.status}
      </Badge>
    </div>
  );
}

function QuickAction({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-colors hover:bg-accent"
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span className="font-medium">{label}</span>
    </button>
  );
}
