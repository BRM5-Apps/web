import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Faction } from "@/types/faction";

interface FactionStoreState {
  activeFactionId: string | null;
  activeFaction: Faction | null;
  userPermissions: string[];
}

interface FactionStoreActions {
  setActiveFaction: (factionId: string, faction?: Faction) => void;
  setFactionData: (faction: Faction) => void;
  setUserPermissions: (permissions: string[]) => void;
  clearActiveFaction: () => void;
}

export const useFactionStore = create<FactionStoreState & FactionStoreActions>()(
  persist(
    (set) => ({
      activeFactionId: null,
      activeFaction: null,
      userPermissions: [],

      setActiveFaction: (factionId, faction) =>
        set({
          activeFactionId: factionId,
          activeFaction: faction ?? null,
          userPermissions: [],
        }),

      setFactionData: (faction) =>
        set({ activeFaction: faction }),

      setUserPermissions: (permissions) =>
        set({ userPermissions: permissions }),

      clearActiveFaction: () =>
        set({
          activeFactionId: null,
          activeFaction: null,
          userPermissions: [],
        }),
    }),
    {
      name: "factionhub-faction",
      partialize: (state) => ({
        activeFactionId: state.activeFactionId,
      }),
    }
  )
);
