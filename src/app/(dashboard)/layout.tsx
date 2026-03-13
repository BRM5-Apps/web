"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useFactions } from "@/hooks/use-faction";
import { useFactionStore } from "@/stores/faction-store";
import { useSidebarStore } from "@/stores/sidebar-store";
import { usePermissions } from "@/hooks/use-permissions";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Loading } from "@/components/shared/loading";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: factions, isLoading: factionsLoading } = useFactions();
  const { activeFactionId, setActiveFaction, setFactionData, setUserPermissions } = useFactionStore();
  const { isCollapsed } = useSidebarStore();

  // Load permissions when faction changes
  const { permissions } = usePermissions(activeFactionId ?? "");

  // Sync permissions to store
  useEffect(() => {
    if (permissions.length > 0) {
      setUserPermissions(permissions);
    }
  }, [permissions, setUserPermissions]);

  // Hydrate faction data from API when we have an ID from localStorage
  useEffect(() => {
    if (activeFactionId && factions) {
      const faction = factions.find((f) => f.id === activeFactionId);
      if (faction) {
        setFactionData(faction);
      }
    }
  }, [activeFactionId, factions, setFactionData]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || factionsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // No factions — show empty state
  if (factions && factions.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">No Factions Yet</h2>
          <p className="text-muted-foreground">
            You are not a member of any faction. Join a faction through Discord or create one to get started.
          </p>
          <button
            onClick={() => router.push("/dashboard/create-faction")}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Create a Faction
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          "flex flex-1 flex-col transition-[margin] duration-300",
          isCollapsed ? "md:ml-[var(--sidebar-collapsed-width)]" : "md:ml-[var(--sidebar-width)]"
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
