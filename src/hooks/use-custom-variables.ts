"use client";

import { useState, useCallback, useEffect } from "react";
import type { ElementCatalogItem } from "@/types/element";

const STORAGE_KEY = "custom-variables:data";

export interface CustomVariable {
  id: string;
  name: string;
  key: string;
  description: string;
  defaultValue: string;
  createdAt: string;
}

// Generate a valid variable key from a name
export function generateVariableKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Convert CustomVariable to ElementCatalogItem
export function toElementCatalogItem(variable: CustomVariable): ElementCatalogItem {
  return {
    id: `custom-var-${variable.id}`,
    name: variable.name,
    variable_key: variable.key,
    element_type: "STATIC",
    description: variable.description || `Custom variable: ${variable.name}`,
    category: "custom_variables",
    source: "user",
    insertions: [`{{var:${variable.key}}}`],
    config: {
      customVariableId: variable.id,
      defaultValue: variable.defaultValue,
    },
  };
}

export function useCustomVariables(serverId: string) {
  const [variables, setVariables] = useState<CustomVariable[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}:${serverId}`);
      if (stored) {
        setVariables(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors
    }
    setIsLoaded(true);
  }, [serverId]);

  // Persist to localStorage when variables change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(`${STORAGE_KEY}:${serverId}`, JSON.stringify(variables));
    } catch {
      // Ignore storage errors
    }
  }, [variables, serverId, isLoaded]);

  const createVariable = useCallback((name: string, description: string = "", defaultValue: string = "") => {
    const key = generateVariableKey(name);
    if (!key) return null;

    const newVariable: CustomVariable = {
      id: crypto.randomUUID(),
      name,
      key,
      description,
      defaultValue,
      createdAt: new Date().toISOString(),
    };

    setVariables((prev) => [...prev, newVariable]);
    return newVariable;
  }, []);

  const updateVariable = useCallback((id: string, updates: Partial<Omit<CustomVariable, "id" | "createdAt">>) => {
    setVariables((prev) =>
      prev.map((v) => {
        if (v.id !== id) return v;
        const updated = { ...v, ...updates };
        // Regenerate key if name changed
        if (updates.name) {
          updated.key = generateVariableKey(updates.name);
        }
        return updated;
      })
    );
  }, []);

  const deleteVariable = useCallback((id: string) => {
    setVariables((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const elementItems = variables.map(toElementCatalogItem);

  return {
    variables,
    elementItems,
    isLoaded,
    createVariable,
    updateVariable,
    deleteVariable,
  };
}
