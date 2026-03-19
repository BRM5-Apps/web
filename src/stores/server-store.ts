import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Server } from "@/types/server";

interface ServerStoreState {
  activeServerId: string | null;
  activeServer: Server | null;
  userPermissions: string[];
}

interface ServerStoreActions {
  setActiveServer: (serverId: string, server?: Server) => void;
  setServerData: (server: Server) => void;
  setUserPermissions: (permissions: string[]) => void;
  clearActiveServer: () => void;
}

export const useServerStore = create<ServerStoreState & ServerStoreActions>()(
  persist(
    (set) => ({
      activeServerId: null,
      activeServer: null,
      userPermissions: [],

      setActiveServer: (serverId, server) =>
        set({
          activeServerId: serverId,
          activeServer: server ?? null,
          userPermissions: [],
        }),

      setServerData: (server) =>
        set({ activeServer: server }),

      setUserPermissions: (permissions) =>
        set({ userPermissions: permissions }),

      clearActiveServer: () =>
        set({
          activeServerId: null,
          activeServer: null,
          userPermissions: [],
        }),
    }),
    {
      name: "serverhub-server",
      partialize: (state) => ({
        activeServerId: state.activeServerId,
      }),
    }
  )
);
