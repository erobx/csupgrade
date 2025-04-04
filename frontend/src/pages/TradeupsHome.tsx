import { useWS } from "../providers/WebSocketProvider"
import { Tradeup } from "../types/tradeup"
import TradeupRow from "../components/Tradeups/TradeupRow"

function TradeupsHome() {
  const { tradeups } = useWS()
  const players: any[] = []

  return (
    <div className="flex flex-col items-center gap-2 mt-3">
      <h1 className="text-warning font-bold text-3xl">Active Tradeups</h1>
      {/* Status Filter Dropwdown */}

      {tradeups.length > 0 ? (
        tradeups.map((t: Tradeup) =>
          <TradeupRow
            id={t.id}
            players={players}
            rarity={t.rarity}
            items={t.items}
            status={"Active"}
          />
        )
      ) : (
        <p>No tradeups available.</p>
      )}
    </div>
  )
}

export default TradeupsHome
