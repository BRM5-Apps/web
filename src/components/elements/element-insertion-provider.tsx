"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { insertTextIntoElement, isSupportedTextInsertionElement } from "@/lib/text-insert";

interface ElementInsertionContextValue {
  insertToken: (token: string) => boolean;
}

const ElementInsertionContext = createContext<ElementInsertionContextValue | null>(null);

export function ElementInsertionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lastFocusedRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    function handleFocusIn(event: FocusEvent) {
      if (isSupportedTextInsertionElement(event.target as Element | null)) {
        lastFocusedRef.current = event.target as HTMLInputElement | HTMLTextAreaElement;
      }
    }

    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, []);

  const insertToken = useCallback((token: string) => {
    const active = isSupportedTextInsertionElement(document.activeElement)
      ? document.activeElement
      : lastFocusedRef.current;

    if (!active) {
      return false;
    }

    insertTextIntoElement(active, token);
    lastFocusedRef.current = active;
    return true;
  }, []);

  const value = useMemo(() => ({ insertToken }), [insertToken]);

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
