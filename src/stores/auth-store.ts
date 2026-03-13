import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthStoreState {
  /** Currently selected faction ID */
  selectedFactionId: string | null;
  /** Cached permission keys for the active faction */
  factionPermissions: string[];
}

interface AuthStoreActions {
  setSelectedFactionId: (factionId: string | null) => void;
  setFactionPermissions: (permissions: string[]) => void;
  clearFactionState: () => void;
}

export const useAuthStore = create<AuthStoreState & AuthStoreActions>()(
  persist(
    (set) => ({
      selectedFactionId: null,
      factionPermissions: [],

      setSelectedFactionId: (factionId) =>
        set({ selectedFactionId: factionId, factionPermissions: [] }),

      setFactionPermissions: (permissions) =>
        set({ factionPermissions: permissions }),

      clearFactionState: () =>
        set({ selectedFactionId: null, factionPermissions: [] }),
    }),
    {
      name: "factionhub-auth",
      partialize: (state) => ({
        selectedFactionId: state.selectedFactionId,
      }),
    }
  )
);
