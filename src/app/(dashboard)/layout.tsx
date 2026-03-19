"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useServers } from "@/hooks/use-server";
import { useServerStore } from "@/stores/server-store";
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
  const { data: servers, isLoading: serversLoading } = useServers();
  const { activeServerId, setServerData, setUserPermissions } = useServerStore();

  // Load permissions when server changes
  const { permissions } = usePermissions(activeServerId ?? "");

  // Sync permissions to store
  useEffect(() => {
    if (permissions.length > 0) {
      setUserPermissions(permissions);
    }
  }, [permissions, setUserPermissions]);

  // Hydrate server data from API when we have an ID from localStorage
  useEffect(() => {
    if (activeServerId && servers) {
      const server = servers.find((f) => f.id === activeServerId);
      if (server) {
        setServerData(server);
      }
    }
  }, [activeServerId, servers, setServerData]);

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
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pl-14 bg-background">
          <div className="mx-auto max-w-screen-xl px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </WebSocketProvider>
  );
}
