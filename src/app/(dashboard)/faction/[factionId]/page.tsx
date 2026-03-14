"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFaction } from "@/hooks/use-faction";
import { useFactionStore } from "@/stores/faction-store";
import { Loading } from "@/components/shared/loading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  Calendar,
  FileText,
  Gavel,
  Settings,
  ShieldCheck,
  Trophy,
  Handshake,
  ArrowRight,
  CreditCard,
  CalendarCheck,
} from "lucide-react";

interface FeatureCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  accent: string;
}

const featureCards: FeatureCard[] = [
  {
    title: "Members",
    description: "View and manage your server members, assign ranks, and track activity.",
    icon: Users,
    href: "/members",
    accent: "text-blue-500 bg-blue-500/10",
  },
  {
    title: "Ranks",
    description: "Configure your rank hierarchy, set permissions, and manage promotions.",
    icon: Shield,
    href: "/ranks",
    accent: "text-violet-500 bg-violet-500/10",
  },
  {
    title: "Units",
    description: "Organise members into operational units and sub-groups.",
    icon: ShieldCheck,
    href: "/units",
    accent: "text-indigo-500 bg-indigo-500/10",
  },
  {
    title: "Events",
    description: "Schedule, manage, and track attendance for server events.",
    icon: Calendar,
    href: "/events",
    accent: "text-emerald-500 bg-emerald-500/10",
  },
  {
    title: "Event Requests",
    description: "Review and approve member-submitted event requests.",
    icon: CalendarCheck,
    href: "/event-requests",
    accent: "text-teal-500 bg-teal-500/10",
  },
  {
    title: "Templates",
    description: "Build embed messages, container templates, and text snippets for the bot.",
    icon: FileText,
    href: "/templates",
    accent: "text-amber-500 bg-amber-500/10",
  },
  {
    title: "Moderation",
    description: "Manage punishments, blacklists, and promotion locks for your server.",
    icon: Gavel,
    href: "/moderation/punishments",
    accent: "text-red-500 bg-red-500/10",
  },
  {
    title: "Leaderboard",
    description: "See the top contributors and most active members in your server.",
    icon: Trophy,
    href: "/leaderboard",
    accent: "text-yellow-500 bg-yellow-500/10",
  },
  {
    title: "Welcome Config",
    description: "Set up automated welcome messages for new members joining your server.",
    icon: Handshake,
    href: "/settings/welcome",
    accent: "text-pink-500 bg-pink-500/10",
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

export default function ServerOverviewPage() {
  const params = useParams<{ factionId: string }>();
  const router = useRouter();
  const factionId = params.factionId;

  const { setActiveFaction, setFactionData } = useFactionStore();
  const { data: faction, isLoading } = useFaction(factionId);

  useEffect(() => {
    if (faction) {
      setActiveFaction(factionId, faction);
      setFactionData(faction);
    }
  }, [faction, factionId, setActiveFaction, setFactionData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading />
      </div>
    );
  }

  if (!faction) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Server not found.</p>
        <Button variant="link" onClick={() => router.push("/faction")}>
          Back to servers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Server header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{faction.name}</h1>
        {faction.description && (
          <p className="text-muted-foreground mt-1">{faction.description}</p>
        )}
      </div>

      {/* Feature grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featureCards.map((feature) => (
          <FeatureCard
            key={feature.href}
            feature={feature}
            onClick={() => router.push(`/faction/${factionId}${feature.href}`)}
          />
        ))}
      </div>
    </div>
  );
}

function FeatureCard({
  feature,
  onClick,
}: {
  feature: FeatureCard;
  onClick: () => void;
}) {
  const Icon = feature.icon;
  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/40 group"
      onClick={onClick}
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
