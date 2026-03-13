"use client";

import { useRouter } from "next/navigation";
import { useFactions } from "@/hooks/use-faction";
import { useFactionStore } from "@/stores/faction-store";
import { Loading } from "@/components/shared/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Shield, Users } from "lucide-react";
import type { Faction } from "@/types/faction";

export default function FactionSelectorPage() {
  const router = useRouter();
  const { data: factions, isLoading } = useFactions();
  const { activeFactionId, setActiveFaction } = useFactionStore();

  function handleSelect(faction: Faction) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Select a Faction</h1>
        <p className="text-muted-foreground">
          Choose a faction to manage, or create a new one.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {factions?.map((faction) => (
          <Card
            key={faction.id}
            className={`cursor-pointer transition-colors hover:bg-accent/50 ${
              faction.id === activeFactionId ? "ring-2 ring-primary" : ""
            }`}
            onClick={() => handleSelect(faction)}
          >
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
              <Avatar className="h-12 w-12">
                {faction.iconUrl ? (
                  <AvatarImage src={faction.iconUrl} alt={faction.name} />
                ) : null}
                <AvatarFallback>
                  <Shield className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <CardTitle className="text-base">{faction.name}</CardTitle>
                <TierBadge tier={faction.subscriptionTier} />
              </div>
            </CardHeader>
            <CardContent>
              {faction.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {faction.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Create Faction card */}
        <Card
          className="cursor-pointer border-dashed transition-colors hover:bg-accent/50"
          onClick={() => router.push("/faction/create")}
        >
          <CardContent className="flex flex-col items-center justify-center gap-2 py-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Create New Faction</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: Faction["subscriptionTier"] }) {
  const variants: Record<string, "default" | "secondary" | "outline"> = {
    free: "outline",
    pro: "default",
    enterprise: "secondary",
  };

  return (
    <Badge variant={variants[tier] ?? "outline"} className="capitalize">
      {tier}
    </Badge>
  );
}
