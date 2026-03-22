"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/providers/auth-provider";
import { useServerStore } from "@/stores/server-store";
import type { WsEventType, WsEnvelope } from "@/types/websocket";

export type WsConnectionStatus = "connecting" | "connected" | "disconnected";

type Handler = (payload: unknown) => void;

interface WebSocketContextValue {
  status: WsConnectionStatus;
  subscribe: <T>(type: WsEventType, handler: (payload: T) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  status: "disconnected",
  subscribe: () => () => {},
});

const WS_BASE_URL = process.env.NEXT_PUBLIC_API_WS_URL ?? "";
const MAX_BACKOFF_MS = 30_000;

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { backendToken } = useAuth();
  const { activeServerId } = useServerStore();
  const [status, setStatus] = useState<WsConnectionStatus>("disconnected");

  const wsRef = useRef<WebSocket | null>(null);
  const backoffRef = useRef(1000);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlersRef = useRef<Map<WsEventType, Set<Handler>>>(new Map());

  const subscribe = useCallback(<T,>(type: WsEventType, handler: (payload: T) => void) => {
    const set = handlersRef.current.get(type) ?? new Set<Handler>();
    set.add(handler as Handler);
    handlersRef.current.set(type, set);
    return () => {
      set.delete(handler as Handler);
      if (set.size === 0) handlersRef.current.delete(type);
    };
  }, []);

  useEffect(() => {
    if (!backendToken || !activeServerId) {
      setStatus("disconnected");
      return;
    }

    let cancelled = false;

    function connect() {
      if (cancelled) return;

      const url = `${WS_BASE_URL}/ws/${activeServerId}?token=${encodeURIComponent(backendToken!)}`;
      setStatus("connecting");

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) { ws.close(); return; }
        backoffRef.current = 1000;
        setStatus("connected");
      };

      ws.onmessage = (event) => {
        try {
          const envelope = JSON.parse(event.data as string) as WsEnvelope;
          const handlers = handlersRef.current.get(envelope.type);
          handlers?.forEach((h) => h(envelope.payload));
        } catch {
          // malformed message — ignore
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        setStatus("disconnected");
        const delay = Math.min(backoffRef.current, MAX_BACKOFF_MS);
        backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS);
        retryTimerRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        setStatus("disconnected");
      };
    }

    connect();

    return () => {
      cancelled = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      wsRef.current?.close();
      wsRef.current = null;
      setStatus("disconnected");
    };
  }, [backendToken, activeServerId]);

  return (
    <WebSocketContext.Provider value={{ status, subscribe }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocket() {
  return useContext(WebSocketContext);
}
