import { createContext, ReactNode, useContext } from "react";
import { useWebSocket } from "../hooks/websocket";
import { Tradeup } from "../types/tradeup";
import { InventoryItem } from "../types/inventory";

interface WebSocketContextType {
  tradeups: Tradeup[];
  currentTradeup: Tradeup | null;
  clearCurrentTradeup: () => void;
  winningItem: InventoryItem | null;
  subscribeToAll: () => void;
  subscribeToTradeup: (tradeupId: string) => void;
  unsubscribe: () => void;
  sendLogin: (userId: string) => void;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

interface WebSocketProviderProps {
  children: ReactNode;
  userId: string;
}

export function WebSocketProvider({ children, userId }: WebSocketProviderProps) {
  const ws = useWebSocket(userId)
  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWS() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWS must be used within a WebSocketProvider")
  }
  return context
}
