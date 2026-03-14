"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useFactions } from "@/hooks/use-faction";
import { useFactionStore } from "@/stores/faction-store";
import { usePermissions } from "@/hooks/use-permissions";
import { Sidebar } from "@/components/layout/sidebar";
import { Loading } from "@/components/shared/loading";
import { WebSocketProvider } from "@/providers/websocket-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: factions, isLoading: factionsLoading } = useFactions();
  const { activeFactionId, setFactionData, setUserPermissions } = useFactionStore();

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

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <WebSocketProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pl-14 p-6">{children}</main>
      </div>
    </WebSocketProvider>
  );
}
