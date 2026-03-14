"use client";

import { useRouter } from "next/navigation";
import { useAdminGuildsWithFactions, type GuildWithFactionStatus } from "@/hooks/use-admin-guilds";
import { useFactionStore } from "@/stores/faction-store";
import { Loading } from "@/components/shared/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, BotOff, Shield } from "lucide-react";
import type { Faction } from "@/types/faction";

const DISCORD_CDN = "https://cdn.discordapp.com";

function guildIconUrl(guild: GuildWithFactionStatus): string | null {
  if (!guild.icon) return null;
  const ext = guild.icon.startsWith("a_") ? "gif" : "png";
  return `${DISCORD_CDN}/icons/${guild.id}/${guild.icon}.${ext}?size=128`;
}

export default function FactionSelectorPage() {
  const router = useRouter();
  const { setActiveFaction } = useFactionStore();
  const { data: guilds, isLoading, isError } = useAdminGuildsWithFactions();

  function handleSelectFaction(faction: Faction) {
    setActiveFaction(faction.id, faction);
    router.push(`/faction/${faction.id}`);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Failed to load servers. Please refresh the page.
      </div>
    );
  }

  const botPresent = guilds?.filter((g) => g.hasBot) ?? [];
  const botAbsent = guilds?.filter((g) => !g.hasBot) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Servers</h1>
        <p className="text-muted-foreground">
          Servers where you have Administrator permissions.{" "}
          {botPresent.length > 0 && (
            <span>
              <span className="text-foreground font-medium">{botPresent.length}</span> have the bot
              active.
            </span>
          )}
        </p>
      </div>

      {guilds?.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
          <Shield className="h-10 w-10 opacity-40" />
          <p className="text-sm">No Discord servers found where you have Administrator permissions.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Bot-present guilds — normal color, clickable */}
        {botPresent.map((guild) => (
          <GuildCard
            key={guild.id}
            guild={guild}
            onClick={() => handleSelectFaction(guild.faction!)}
          />
        ))}

        {/* Bot-absent guilds — greyed out */}
        {botAbsent.map((guild) => (
          <GuildCard key={guild.id} guild={guild} />
        ))}
      </div>
    </div>
  );
}

interface GuildCardProps {
  guild: GuildWithFactionStatus;
  onClick?: () => void;
}

function GuildCard({ guild, onClick }: GuildCardProps) {
  const iconUrl = guildIconUrl(guild);
  const isActive = guild.hasBot;

  return (
    <Card
      className={[
        "transition-colors",
        isActive
          ? "cursor-pointer hover:bg-accent/50"
          : "opacity-50 cursor-default select-none",
      ].join(" ")}
      onClick={isActive ? onClick : undefined}
      title={
        isActive
          ? `Open ${guild.name}`
          : `${guild.name} — Add the bot to this server to manage it`
      }
    >
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
        <Avatar className="h-11 w-11 shrink-0">
          {iconUrl ? (
            <AvatarImage src={iconUrl} alt={guild.name} />
          ) : null}
          <AvatarFallback className={isActive ? "" : "bg-muted text-muted-foreground"}>
            <Shield className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-1">
          <CardTitle className="text-sm leading-tight truncate">{guild.name}</CardTitle>
          <StatusBadge guild={guild} />
        </div>
      </CardHeader>

      {isActive && guild.faction && (
        <CardContent className="pt-0">
          {guild.faction.description ? (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {guild.faction.description}
            </p>
          ) : null}
          <div className="mt-2 flex items-center gap-1.5">
            <TierBadge tier={guild.faction.subscriptionTier} />
          </div>
        </CardContent>
      )}

      {!isActive && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <BotOff className="h-3 w-3 shrink-0" />
            Bot not added
          </p>
        </CardContent>
      )}
    </Card>
  );
}

function StatusBadge({ guild }: { guild: GuildWithFactionStatus }) {
  if (guild.hasBot) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
        <Bot className="h-3 w-3" />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <BotOff className="h-3 w-3" />
      No bot
    </span>
  );
}

function TierBadge({ tier }: { tier: Faction["subscriptionTier"] }) {
  const variants: Record<string, "default" | "secondary" | "outline"> = {
    free: "outline",
    pro: "default",
    enterprise: "secondary",
  };

  return (
    <Badge variant={variants[tier] ?? "outline"} className="capitalize text-xs">
      {tier}
    </Badge>
  );
}
