"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { useFactions } from "@/hooks/use-faction";
import { useFactionStore } from "@/stores/faction-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";

export function FactionSwitcher() {
  const router = useRouter();
  const { data: factions, isLoading } = useFactions();
  const { activeFactionId, setActiveFaction } = useFactionStore();
  const [search, setSearch] = useState("");

  // Normalize factions in case cached data still uses the older
  // { items: [{ faction, rankId }] } shape from the API client.
  const factionList =
    Array.isArray(factions)
      ? factions
      : (factions as any)?.items?.map((item: any) => item.faction) ?? [];

  const filteredFactions = factionList.filter((f: any) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeFaction = factionList.find((f: any) => f.id === activeFactionId);

  function handleSelect(factionId: string) {
    const faction = factions?.find((f) => f.id === factionId);
    setActiveFaction(factionId, faction);
    router.push(`/faction/${factionId}`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal"
          disabled={isLoading}
        >
          <span className="truncate">
            {activeFaction?.name ?? "Select server"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--sidebar-width)] p-0" align="start">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search servers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-[300px]">
          {filteredFactions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No servers found
            </div>
          ) : (
            filteredFactions.map((faction: any) => (
              <DropdownMenuItem
                key={faction.id}
                onClick={() => handleSelect(faction.id)}
                className="flex items-center gap-3 px-3 py-2"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  {faction.iconUrl ? (
                    <img
                      src={faction.iconUrl}
                      alt={faction.name}
                      className="h-6 w-6 rounded"
                    />
                  ) : (
                    <span className="text-xs font-bold text-primary">
                      {faction.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium truncate">{faction.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {faction.subscriptionTier}
                  </p>
                </div>
                {faction.id === activeFactionId && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/faction")}
          className="gap-2 px-3 py-2"
        >
          <Plus className="h-4 w-4" />
          Browse Servers
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
