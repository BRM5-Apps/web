// Re-export from provider so components import from hooks/, not providers/.
export { useWebSocket } from "@/providers/websocket-provider";
export type { WsConnectionStatus } from "@/providers/websocket-provider";
