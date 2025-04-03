import { useEffect } from "react"
import { useWS } from "../providers/WebSocketProvider"
import { Tradeup } from "../types/tradeup"

function TradeupsHome() {
  const { tradeups, subscribeToAll, unsubscribe } = useWS()

  useEffect(() => {
    subscribeToAll()

    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <div className="flex flex-col items-center mt-5">
      <h1 className="font-bold text-3xl">Active Tradeups</h1>
      {tradeups.length > 0 ? (
        tradeups.map((t: Tradeup) => <p key={t.id}>{t.rarity}</p>)
      ) : (
        <p>No tradeups available.</p>
      )}
    </div>
  )
}

export default TradeupsHome
