import { useWS } from "../providers/WebSocketProvider"
import { Tradeup } from "../types/tradeup"
import TradeupRow from "../components/Tradeups/TradeupRow"
import { useMemo } from "react"

function TradeupsHome() {
  const { tradeups } = useWS()

  const displayTradeups = useMemo(() => {
    return tradeups.sort((a, b) => parseInt(a.id) - parseInt(b.id))
  }, [tradeups])

  return (
    <div className="flex flex-col items-center gap-2 mt-3">
      <h1 className="text-warning font-bold text-3xl">Active Tradeups</h1>
      {/* Status Filter Dropwdown */}

      {tradeups.length > 0 ? (
        displayTradeups.map((t: Tradeup) =>
          <TradeupRow
            id={t.id}
            players={t.players}
            rarity={t.rarity}
            items={t.items}
            mode={t.mode}
          />
        )
      ) : (
        <p>No tradeups available.</p>
      )}
    </div>
  )
}

export default TradeupsHome
