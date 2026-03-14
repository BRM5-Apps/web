"use client";

import { useRouter } from "next/navigation";
import { Plus, AlertCircle } from "lucide-react";
import { useFactions } from "@/hooks/use-faction";
import { useFactionStore } from "@/stores/faction-store";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import type { Faction } from "@/types/faction";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServerCardProps {
  faction: Faction;
  onSelect: (faction: Faction) => void;
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
        </div>
      )}
    </div>
  );
}

// ─── Server card ──────────────────────────────────────────────────────────────

function ServerCard({ faction, onSelect }: ServerCardProps) {
  return (
    <button
      onClick={() => onSelect(faction)}
      className={cn(
        "flex flex-col items-start gap-3 rounded-lg border border-border bg-card p-4 text-left",
        "transition-all duration-150",
        "hover:border-white/20 hover:shadow-[0_0_0_1px_hsl(0_0%_100%/0.12)]"
      )}
    >
      <div className="flex items-center gap-3">
        {faction.iconUrl ? (
          <img
            src={faction.iconUrl}
            alt={faction.name}
            className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-lg font-bold text-foreground">
            {faction.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-foreground">
            {faction.name}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {faction.subscriptionTier}
          </p>
        </div>
      </div>
    </button>
  );
}

// ─── Add server card ──────────────────────────────────────────────────────────

function AddServerCard() {
  const installUrl = process.env.NEXT_PUBLIC_BOT_INSTALL_URL ?? "#";

  return (
    <a
      href={installUrl}
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
  const { data: factions, isLoading, isError, refetch } = useFactions();
  const { setActiveFaction } = useFactionStore();

  function handleSelect(faction: Faction) {
    setActiveFaction(faction.id, faction);
    router.push(`/faction/${faction.id}`);
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
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-lg border border-border bg-card"
                  />
                ))}
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center gap-4 py-12 text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <p className="text-[13px] text-muted-foreground">
                  Could not load your servers.
                </p>
                <button
                  onClick={() => refetch()}
                  className="rounded-md border border-border px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-white/5"
                >
                  Try again
                </button>
              </div>
            )}

            {!isLoading && !isError && (
              <>
                {factions && factions.length === 0 && (
                  <p className="mb-6 text-[13px] text-muted-foreground">
                    No servers found. Add the BRM5 bot to your Discord server to get started.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {factions?.map((faction) => (
                    <ServerCard
                      key={faction.id}
                      faction={faction}
                      onSelect={handleSelect}
                    />
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
