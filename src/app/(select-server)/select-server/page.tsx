"use client";

import { useRouter } from "next/navigation";
import { Plus, AlertCircle, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useAdminGuildsWithFactions, type GuildWithFactionStatus } from "@/hooks/use-admin-guilds";
import { useFactionStore } from "@/stores/faction-store";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServerCardProps {
  guild: GuildWithFactionStatus;
  onSelect: (guild: GuildWithFactionStatus) => void;
}

// ─── Top bar ──────────────────────────────────────────────────────────────────

function TopBar() {
  const { user } = useAuth();

  return (
    <div className="flex h-14 items-center justify-between border-b border-border px-6">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
          <span className="text-xs font-bold text-foreground">B</span>
        </div>
        <span className="text-[13px] font-semibold text-foreground">BRM5</span>
      </div>

      {user && (
        <div className="flex items-center gap-2">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-[13px] text-muted-foreground">{user.username}</span>
          <button
            onClick={async () => {
              await fetch("/api/auth/clear", { method: "POST" });
              await signOut({ callbackUrl: "/login" });
            }}
            className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Server card ──────────────────────────────────────────────────────────────

const BOT_INSTALL_URL = process.env.NEXT_PUBLIC_BOT_INSTALL_URL ?? "";

function buildBotInstallUrl(guildId: string): string {
  if (!BOT_INSTALL_URL) return "#";
  return `${BOT_INSTALL_URL}&guild_id=${guildId}`;
}

function ServerCard({ guild, onSelect }: ServerCardProps) {
  const iconUrl = guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
    : null;

  if (!guild.hasBot) {
    return (
      <a
        href={buildBotInstallUrl(guild.id)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex w-full flex-col items-start gap-3 overflow-hidden rounded-lg border border-border bg-card p-4 text-left",
          "opacity-50 transition-opacity duration-150 hover:opacity-70"
        )}
      >
        <div className="flex w-full items-center gap-3 overflow-hidden">
          {iconUrl ? (
            <img src={iconUrl} alt={guild.name} className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-bold text-foreground">
              {guild.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-foreground">{guild.name}</p>
            <p className="text-xs text-muted-foreground">Add Bot</p>
          </div>
        </div>
      </a>
    );
  }

  return (
    <button
      onClick={() => onSelect(guild)}
      className={cn(
        "flex w-full flex-col items-start gap-3 overflow-hidden rounded-lg border border-border bg-card p-4 text-left",
        "transition-all duration-150",
        "hover:border-white/20 hover:shadow-[0_0_0_1px_hsl(0_0%_100%/0.12)]"
      )}
    >
      <div className="flex w-full items-center gap-3 overflow-hidden">
        {iconUrl ? (
          <img src={iconUrl} alt={guild.name} className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-bold text-foreground">
            {guild.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-foreground">{guild.name}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {guild.faction?.subscriptionTier ?? "Free"}
          </p>
        </div>
      </div>
    </button>
  );
}

// ─── Add server card ──────────────────────────────────────────────────────────

function AddServerCard() {
  return (
    <a
      href={BOT_INSTALL_URL || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-lg",
        "border border-dashed border-border",
        "text-muted-foreground transition-colors duration-150",
        "hover:border-white/20 hover:text-foreground"
      )}
    >
      <Plus className="h-5 w-5" />
      <span className="text-[13px] font-medium">Add Server</span>
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SelectServerPage() {
  const router = useRouter();
  const { data: guilds, isLoading, isError } = useAdminGuildsWithFactions();
  const { setActiveFaction } = useFactionStore();

  function handleSelect(guild: GuildWithFactionStatus) {
    if (!guild.faction) return;
    setActiveFaction(guild.faction.id, guild.faction);
    router.push(`/faction/${guild.faction.id}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />

      <div className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="w-full max-w-[900px]">
          <h1 className="text-lg font-semibold text-foreground">Your Servers</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Select a server to manage
          </p>

          <div className="mt-8">
            {isLoading && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-lg border border-border bg-card" />
                ))}
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <p className="text-[13px] text-muted-foreground">
                  Could not load your servers.
                </p>
              </div>
            )}

            {!isLoading && !isError && (
              <>
                {guilds && guilds.length === 0 && (
                  <p className="mb-6 text-[13px] text-muted-foreground">
                    No eligible servers found. You need Manage Server permission to use FactionHub.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {[...(guilds ?? [])].sort((a, b) => Number(b.hasBot) - Number(a.hasBot)).map((guild) => (
                    <ServerCard key={guild.id} guild={guild} onSelect={handleSelect} />
                  ))}
                  <AddServerCard />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
