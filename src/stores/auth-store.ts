import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStoreState {
  /** Currently selected server ID */
  selectedServerId: string | null;
  /** Cached permission keys for the active server */
  serverPermissions: string[];
}

interface AuthStoreActions {
  setSelectedServerId: (serverId: string | null) => void;
  setServerPermissions: (permissions: string[]) => void;
  clearServerState: () => void;
}

export const useAuthStore = create<AuthStoreState & AuthStoreActions>()(
  persist(
    (set) => ({
      selectedServerId: null,
      serverPermissions: [],

      setSelectedServerId: (serverId) =>
        set({ selectedServerId: serverId, serverPermissions: [] }),

      setServerPermissions: (permissions) =>
        set({ serverPermissions: permissions }),

      clearServerState: () =>
        set({ selectedServerId: null, serverPermissions: [] }),
    }),
    {
      name: "serverhub-auth",
      partialize: (state) => ({
        selectedServerId: state.selectedServerId,
      }),
    }
  )
);
