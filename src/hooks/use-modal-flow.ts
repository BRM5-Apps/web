/**
 * use-modal-flow.ts
 *
 * Hook for managing modal flow state (action graph and settings).
 * Provides state management and sync logic between simple settings and action graph.
 */

import { useState, useCallback, useMemo } from "react";
import type { ActionGraphDocument, ModalSettings } from "../components/component-v2/types";
import { createDefaultModalGraph, settingsToActions, actionsToSettings } from "../components/modal-workbench/modal-settings-sync";

export interface ModalField {
  id: string;
  type: string;
  label: string;
  required: boolean;
}

export interface UseModalFlowOptions {
  initialGraph?: ActionGraphDocument;
  initialSettings?: ModalSettings;
  fields?: ModalField[];
}

export interface UseModalFlowReturn {
  // State
  graph: ActionGraphDocument;
  settings: ModalSettings;

  // Actions
  setGraph: (graph: ActionGraphDocument) => void;
  setSettings: (settings: ModalSettings) => void;
  updateGraph: (updater: (graph: ActionGraphDocument) => ActionGraphDocument) => void;
  updateSettings: (updater: (settings: ModalSettings) => ModalSettings) => void;
  reset: () => void;

  // Computed
  hasActions: boolean;
  totalActionCount: number;

  // Conversion
  exportFlow: () => { graph: ActionGraphDocument; settings: ModalSettings };
}

export function useModalFlow(options: UseModalFlowOptions = {}): UseModalFlowReturn {
  const { initialGraph, initialSettings, fields = [] } = options;

  // Initialize graph from fields if no initial graph
  const getInitialGraph = useCallback(() => {
    if (initialGraph && initialGraph.nodes.length > 0) {
      return initialGraph;
    }
    return createDefaultModalGraph(fields).graph;
  }, [initialGraph, fields]);

  const [graph, setGraphState] = useState<ActionGraphDocument>(getInitialGraph);
  const [settings, setSettingsState] = useState<ModalSettings>(initialSettings ?? {});

  // Update graph and optionally sync settings
  const setGraph = useCallback((newGraph: ActionGraphDocument) => {
    setGraphState(newGraph);
  }, []);

  // Update settings and sync to graph
  const setSettings = useCallback((newSettings: ModalSettings) => {
    setSettingsState(newSettings);
    // Sync settings changes to graph
    const actions = settingsToActions(newSettings);
    // We don't modify the graph here - that's handled by the workbench
    // The workbench will call setGraph when it needs to sync
  }, []);

  // Update graph with function
  const updateGraph = useCallback(
    (updater: (graph: ActionGraphDocument) => ActionGraphDocument) => {
      setGraphState((prev) => updater(prev));
    },
    []
  );

  // Update settings with function
  const updateSettings = useCallback(
    (updater: (settings: ModalSettings) => ModalSettings) => {
      setSettingsState((prev) => {
        const next = updater(prev);
        return next;
      });
    },
    []
  );

  // Reset to initial state
  const reset = useCallback(() => {
    setGraphState(getInitialGraph());
    setSettingsState(initialSettings ?? {});
  }, [getInitialGraph, initialSettings]);

  // Compute action count (excluding field nodes)
  const totalActionCount = useMemo(() => {
    return graph.nodes.filter((n) => n.kind === "action").length;
  }, [graph.nodes]);

  const hasActions = totalActionCount > 0;

  // Export flow data
  const exportFlow = useCallback(() => {
    return { graph, settings };
  }, [graph, settings]);

  return {
    graph,
    settings,
    setGraph,
    setSettings,
    updateGraph,
    updateSettings,
    reset,
    hasActions,
    totalActionCount,
    exportFlow,
  };
}

/**
 * Convert modal builder's template data to fields array for the workbench.
 */
export function templateDataToFields(
  templateData: Record<string, any>
): ModalField[] {
  const fields: ModalField[] = [];
  const pages = (templateData.pages ?? []) as Array<{
    id: string;
    title: string;
    components: Array<{
      id: string;
      type: string;
      label: string;
      required: boolean;
    }>;
  }>;

  for (const page of pages) {
    for (const component of page.components ?? []) {
      // Skip text-display as it's not an input field
      if (component.type === "text-display") continue;

      fields.push({
        id: component.id,
        type: component.type,
        label: component.label,
        required: component.required ?? false,
      });
    }
  }

  return fields;
}

/**
 * Convert modal builder's output locations to settings format.
 */
export function outputLocationsToSettings(
  outputLocations: Array<{ channelId: string; mentions: string[] }>
): ModalSettings {
  return {
    outputChannels: outputLocations.map((loc) => loc.channelId),
    mentions: outputLocations.flatMap((loc) => loc.mentions),
  };
}

/**
 * Convert settings to output locations format.
 */
export function settingsToOutputLocations(
  settings: ModalSettings
): Array<{ channelId: string; mentions: string[] }> {
  const outputChannels = settings.outputChannels ?? [];
  const mentions = settings.mentions ?? [];

  // If multiple channels, spread mentions across first one
  // This is a simplification - the workbench can handle more complex scenarios
  return outputChannels.map((channelId, index) => ({
    channelId,
    mentions: index === 0 ? mentions : [],
  }));
}

export default useModalFlow;