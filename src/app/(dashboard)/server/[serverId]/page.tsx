"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useServer } from "@/hooks/use-server";
import { useStats } from "@/hooks/use-stats";
import { useServerStore } from "@/stores/server-store";
import { StatCard } from "@/components/shared/stat-card";
import { Loading } from "@/components/shared/loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  Calendar,
  Gavel,
  Settings,
  ShieldCheck,
  Handshake,
  ArrowRight,
  CreditCard,
  MessageSquarePlus,
  LayoutTemplate,
  BarChart3,
  Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FeatureCardConfig {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  accent: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const featureCards: FeatureCardConfig[] = [
  {
    title: "Message Builder",
    description: "Compose and send Discord messages and embeds directly from the dashboard.",
    icon: MessageSquarePlus,
    href: "/message-builder",
    accent: "text-blue-500 bg-blue-500/10",
  },
  {
    title: "Modal Builder",
    description: "Build interactive modals linked to message buttons with custom output.",
    icon: LayoutTemplate,
    href: "/modal-builder",
    accent: "text-purple-500 bg-purple-500/10",
  },
  {
    title: "Welcome & Goodbye",
    description: "Design automated welcome and goodbye messages for your server.",
    icon: Handshake,
    href: "/settings/welcome",
    accent: "text-pink-500 bg-pink-500/10",
  },
  {
    title: "Ranks",
    description: "Configure rank hierarchy, level order, prefixes, and Discord role assignments.",
    icon: Shield,
    href: "/ranks",
    accent: "text-violet-500 bg-violet-500/10",
  },
  {
    title: "Permissions",
    description: "Set dashboard and command permissions per rank with advanced condition rules.",
    icon: ShieldCheck,
    href: "/permissions",
    accent: "text-indigo-500 bg-indigo-500/10",
  },
  {
    title: "Members",
    description: "View and manage your server members, assign ranks, and track activity.",
    icon: Users,
    href: "/members",
    accent: "text-emerald-500 bg-emerald-500/10",
  },
  {
    title: "Events",
    description: "Schedule, manage, and track attendance for server events.",
    icon: Calendar,
    href: "/events",
    accent: "text-teal-500 bg-teal-500/10",
  },
  {
    title: "Moderation",
    description: "Manage punishments, blacklists, and promotion locks for your server.",
    icon: Gavel,
    href: "/moderation",
    accent: "text-red-500 bg-red-500/10",
  },
  {
    title: "Scheduled Messages",
    description: "Automate message delivery to Discord channels on a recurring schedule.",
    icon: Clock,
    href: "/schedule",
    accent: "text-sky-500 bg-sky-500/10",
  },
  {
    title: "Analytics",
    description: "View server stats, activity trends, and member leaderboard rankings.",
    icon: BarChart3,
    href: "/stats",
    accent: "text-amber-500 bg-amber-500/10",
  },
  {
    title: "Settings",
    description: "Configure server-wide options, permissions, event types, and more.",
    icon: Settings,
    href: "/settings",
    accent: "text-slate-400 bg-slate-500/10",
  },
  {
    title: "Billing",
    description: "Manage your subscription tier and billing details.",
    icon: CreditCard,
    href: "/billing",
    accent: "text-cyan-500 bg-cyan-500/10",
  },
];

// ─── Stats row ────────────────────────────────────────────────────────────────

function ServerStatsRow({ serverId }: { serverId: string }) {
  const { data: stats, isLoading, isError } = useStats(serverId);

  if (isLoading) {
    return (
      <>
        <StatCard label="Total Members" isLoading />
        <StatCard label="Active Members" isLoading />
        <StatCard label="Total Ranks" isLoading />
      </>
    );
  }

  if (isError || !stats) {
    return (
      <>
        <StatCard label="Total Members" value="—" />
        <StatCard label="Active Members" value="—" />
        <StatCard label="Total Ranks" value="—" />
      </>
    );
  }

  return (
    <>
      <StatCard label="Total Members" value={stats.totalMembers} />
      <StatCard label="Active Members" value={stats.activeMembers} />
      <StatCard label="Total Ranks" value={stats.rankCount} />
    </>
  );
}

// ─── Quick actions ────────────────────────────────────────────────────────────

function QuickActions({ serverId }: { serverId: string }) {
  const router = useRouter();
  const base = `/server/${serverId}`;
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => router.push(`${base}/message-builder`)}>
        Send Message
      </Button>
      <Button variant="outline" size="sm" onClick={() => router.push(`${base}/ranks`)}>
        Manage Ranks
      </Button>
      <Button variant="outline" size="sm" onClick={() => router.push(`${base}/settings/welcome`)}>
        Welcome & Goodbye
      </Button>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({
  feature,
  onClick,
}: {
  feature: FeatureCardConfig;
  onClick: () => void;
}) {
  const Icon = feature.icon;
  return (
    <Card
      role="button"
      tabIndex={0}
      className="cursor-pointer transition-colors hover:bg-accent/40 group"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${feature.accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <CardTitle className="text-base">{feature.title}</CardTitle>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm leading-relaxed">
          {feature.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServerOverviewPage() {
  const params = useParams<{ serverId: string }>();
  const router = useRouter();
  const serverId = params.serverId;

  const { setActiveServer } = useServerStore();
  const { data: serverData, isLoading } = useServer(serverId);
  // API returns { server: { server: Server, member_count } }
  const server = serverData?.server?.server;
  const memberCount = serverData?.server?.member_count;

  useEffect(() => {
    if (server) {
      setActiveServer(serverId, server);
    }
  }, [server, serverId, setActiveServer]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading />
      </div>
    );
  }

  if (!server) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Server not found.</p>
        <Button variant="link" onClick={() => router.push("/server")}>
          Back to servers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Server header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{server.name}</h1>
        {server.description && (
          <p className="text-muted-foreground mt-1">{server.description}</p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
        <ServerStatsRow serverId={serverId} />
        <StatCard label="Subscription" value={server.subscriptionTier} isLoading={isLoading} />
      </div>

      {/* Quick actions */}
      <QuickActions serverId={serverId} />

      {/* Feature grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
        {featureCards.map((feature) => (
          <FeatureCard
            key={feature.href}
            feature={feature}
            onClick={() => router.push(`/server/${serverId}${feature.href}`)}
          />
        ))}
      </div>
    </div>
  );
}
