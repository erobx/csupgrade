import { useState, useEffect, useRef } from "react";
import { Tradeup } from "../types/tradeup";
import { useInventory } from "../providers/InventoryProvider";
import { InventoryItem } from "../types/inventory";
import { useNotification } from "../stores/notificationStore";

export function useWebSocket(userId: string) {
  const [tradeups, setTradeups] = useState<Tradeup[]>([])
  const [currentTradeup, setCurrentTradeup] = useState<Tradeup | null>(null)
  const [winningItem, setWinningItem] = useState<InventoryItem | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { addItem } = useInventory()
  const { setNotification } = useNotification()
  const ws = useRef<WebSocket>(null)

  useEffect(() => {
    function connectWebSocket() {
      // If user is logged in, send their userId; o/w connect as anon
      const socketUrl = userId
        ? `ws://localhost:8080/ws?userId=${userId}`
        : `ws://localhost:8080/ws`

      ws.current = new WebSocket(socketUrl)

      ws.current.onopen = () => {
        console.log("WebSocket connected")
        setIsConnected(true)
        //subscribeToAll() // default to all tradeups
      }

      ws.current.onmessage = (event: any) => {
        const data = JSON.parse(event.data)

        if (data.event === "sync_state") {
          const tradeupArray: Tradeup[] = Object.values(data.tradeups)
          setTradeups(tradeupArray)
        } else if (data.event === "sync_tradeup") {
          setCurrentTradeup(data.tradeup)
        } else if (data.event === "tradeup_winner") {
          if (data.userId === userId) {
            addItem({ ...data.winningItem, visible: true })
            setWinningItem(data.winningItem)
            setNotification(`New item won ${data.winningItem.data.name}`)
          }
        } else if (data.event === "new_item") {
          addItem({ ...data.item, visible: true })
        }
      }

      ws.current.onclose = () => {
        console.log("WebSocket disconnected, reconnecting...")
        setTimeout(connectWebSocket, 2000) // Auto-reconnect
        setIsConnected(false)
      }
    }
    
    connectWebSocket()

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [userId]) // Reconnect only if userId changes (user logs in)

  function clearCurrentTradeup() {
    setCurrentTradeup(null)
  }

  function subscribeToAll() {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ event: "subscribe_all" }))
    }
  }

  function subscribeToTradeup(tradeupId: string) {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ event: "subscribe_one", tradeupId: tradeupId }))
    }
  }

  function unsubscribe() {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ event: "unsubscribe"}))
    }
  }

  function sendLogin(userId: string) {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ event: "login", userId }))
    }
  }

  return { tradeups, currentTradeup, clearCurrentTradeup, winningItem, subscribeToAll, subscribeToTradeup, unsubscribe, sendLogin, isConnected }
}
