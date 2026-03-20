"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { insertTextIntoElement, isSupportedTextInsertionElement } from "@/lib/text-insert";
import { toast } from "sonner";

interface ElementInsertionContextValue {
  insertToken: (token: string) => boolean;
  registerDropZone: (element: HTMLElement | null) => void;
  unregisterDropZone: (element: HTMLElement) => void;
}

const ElementInsertionContext = createContext<ElementInsertionContextValue | null>(null);

export function ElementInsertionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lastFocusedRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const dropZonesRef = useRef<Set<HTMLElement>>(new Set());
  const [activeDropZone, setActiveDropZone] = useState<HTMLElement | null>(null);

  // Track focus for click insertion
  useEffect(() => {
    function handleFocusIn(event: FocusEvent) {
      if (isSupportedTextInsertionElement(event.target as Element | null)) {
        lastFocusedRef.current = event.target as HTMLInputElement | HTMLTextAreaElement;
      }
    }

    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, []);

  // Handle global drag and drop
  useEffect(() => {
    function handleDragOver(e: DragEvent) {
      // Check if we're over a registered drop zone
      const target = e.target as HTMLElement;
      const dropZone = findDropZone(target);

      if (dropZone) {
        e.preventDefault();
        e.dataTransfer!.dropEffect = "copy";
        setActiveDropZone(dropZone);
      } else {
        setActiveDropZone(null);
      }
    }

    function handleDragLeave(e: DragEvent) {
      const target = e.target as HTMLElement;
      // Only clear if we're leaving the drop zone entirely, not entering a child
      if (activeDropZone && !activeDropZone.contains(target)) {
        setActiveDropZone(null);
      }
    }

    function handleDrop(e: DragEvent) {
      const target = e.target as HTMLElement;
      const dropZone = findDropZone(target);

      if (dropZone) {
        e.preventDefault();
        const text = e.dataTransfer?.getData("text/plain");
        if (text) {
          // Try to find an input/textarea within the drop zone
          const input = findInputInDropZone(dropZone);
          if (input) {
            // If we have the exact cursor position from the drop event, use it
            const rect = input.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const relativeY = e.clientY - rect.top;

            // Focus first
            input.focus();

            // Try to set cursor position based on drop coordinates
            setCursorPositionFromPoint(input, relativeX, relativeY);

            // Insert the text
            insertTextIntoElement(input, text);
            toast.success("Element inserted");
          }
        }
        setActiveDropZone(null);
      }
    }

    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);

    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
    };
  }, []);

  // Helper to find the nearest registered drop zone
  function findDropZone(element: HTMLElement | null): HTMLElement | null {
    if (!element) return null;
    if (dropZonesRef.current.has(element)) return element;
    return findDropZone(element.parentElement);
  }

  // Helper to find an input/textarea within a drop zone
  function findInputInDropZone(dropZone: HTMLElement): HTMLInputElement | HTMLTextAreaElement | null {
    // First check if the drop zone itself is an input
    if (isSupportedTextInsertionElement(dropZone)) {
      return dropZone as HTMLInputElement | HTMLTextAreaElement;
    }
    // Otherwise look for one inside
    const input = dropZone.querySelector("input[type=\"text\"], input:not([type]), textarea") as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    return input;
  }

  // Rough approximation of setting cursor position from drop coordinates
  function setCursorPositionFromPoint(
    input: HTMLInputElement | HTMLTextAreaElement,
    x: number,
    y: number
  ) {
    // For textareas and text inputs, we can try to approximate
    if (input instanceof HTMLTextAreaElement) {
      // Get line height
      const computedStyle = window.getComputedStyle(input);
      const lineHeight = parseInt(computedStyle.lineHeight) || 20;
      const paddingTop = parseInt(computedStyle.paddingTop) || 0;
      const paddingLeft = parseInt(computedStyle.paddingLeft) || 0;

      // Approximate line and column
      const row = Math.floor((y - paddingTop) / lineHeight);
      const lines = input.value.split("\n");
      const targetLine = Math.max(0, Math.min(row, lines.length - 1));
      const charWidth = parseInt(computedStyle.fontSize) * 0.6; // Rough estimate
      const col = Math.floor((x - paddingLeft) / charWidth);

      // Calculate position
      let position = 0;
      for (let i = 0; i < targetLine; i++) {
        position += lines[i].length + 1; // +1 for newline
      }
      position += Math.min(col, lines[targetLine]?.length || 0);

      input.setSelectionRange(position, position);
    }
    // For simple inputs, just focus and let it insert at end or current position
  }

  const insertToken = useCallback((token: string) => {
    const active = isSupportedTextInsertionElement(document.activeElement)
      ? (document.activeElement as HTMLInputElement | HTMLTextAreaElement)
      : lastFocusedRef.current;

    if (!active) {
      return false;
    }

    insertTextIntoElement(active, token);
    lastFocusedRef.current = active;
    return true;
  }, []);

  const registerDropZone = useCallback((element: HTMLElement | null) => {
    if (element) {
      dropZonesRef.current.add(element);
      element.setAttribute("data-drop-zone", "true");
    }
  }, []);

  const unregisterDropZone = useCallback((element: HTMLElement) => {
    dropZonesRef.current.delete(element);
    element.removeAttribute("data-drop-zone");
    if (activeDropZone === element) {
      setActiveDropZone(null);
    }
  }, [activeDropZone]);

  const value = useMemo(
    () => ({ insertToken, registerDropZone, unregisterDropZone }),
    [insertToken, registerDropZone, unregisterDropZone]
  );

  return (
    <ElementInsertionContext.Provider value={value}>
      {children}
    </ElementInsertionContext.Provider>
  );
}

export function useElementInsertion() {
  const context = useContext(ElementInsertionContext);
  if (!context) {
    throw new Error("useElementInsertion must be used within ElementInsertionProvider");
  }
  return context;
}

// Hook to register a container as a drop zone
export function useElementDropZone(
  ref: React.RefObject<HTMLElement | null>,
  options?: { enabled?: boolean }
) {
  const { registerDropZone, unregisterDropZone } = useElementInsertion();
  const enabled = options?.enabled ?? true;

  useEffect(() => {
    if (!enabled) return;
    const element = ref.current;
    if (element) {
      registerDropZone(element);
      return () => {
        unregisterDropZone(element);
      };
    }
  }, [ref, enabled, registerDropZone, unregisterDropZone]);
}
