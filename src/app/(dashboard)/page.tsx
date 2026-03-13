"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFactionStore } from "@/stores/faction-store";
import { useFactions } from "@/hooks/use-faction";
import { Loading } from "@/components/shared/loading";

export default function DashboardPage() {
  const router = useRouter();
  const { activeFactionId, setActiveFaction } = useFactionStore();
  const { data: factions, isLoading } = useFactions();

  useEffect(() => {
    if (isLoading) return;

    // If user has a persisted faction, go to it
    if (activeFactionId) {
      router.replace(`/faction/${activeFactionId}`);
      return;
    }

    // Auto-select first faction if only one
    if (factions && factions.length === 1) {
      setActiveFaction(factions[0].id, factions[0]);
      router.replace(`/faction/${factions[0].id}`);
      return;
    }

    // Multiple factions, no selection — stay on dashboard to pick one
  }, [activeFactionId, factions, isLoading, router, setActiveFaction]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loading />
      </div>
    );
  }

  // Show faction selection prompt when multiple factions exist
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Welcome to FactionHub</h1>
        <p className="page-description">
          Select a faction from the sidebar to get started.
        </p>
      </div>
    </div>
  );
}
