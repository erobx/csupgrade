import { useWS } from "../providers/WebSocketProvider"
import { Tradeup } from "../types/tradeup"
import TradeupRow from "../components/Tradeups/TradeupRow"
import { useState } from "react"
import { btnMap, rarityOrder } from "../constants/constants"
import Footer from "../components/Footer"

function TradeupsHome() {
  const { tradeups } = useWS()
  const [selectedRarity, setSelectedRarity] = useState("All")

  const sorted = tradeups.sort((a, b) => b.items.length - a.items.length)
  const displayTradeups = selectedRarity === "All"
      ? sorted
      : sorted.filter(t => t.rarity === selectedRarity)

  const handleReset = () => {
    setSelectedRarity("All")
  }

  return (
    <div className="flex flex-col h-screen items-center gap-2 mt-3">
      <h1 className="text-warning font-bold text-3xl">Active Tradeups</h1>
      {/* Status Filter Dropwdown */}
      <div className="filter mb-4 flex gap-1">
        <input
          className="btn btn-soft filter-reset"
          type="radio"
          name=""
          aria-label="×"
          onClick={handleReset}
        />
        {rarityOrder.filter(r => r !== "All").map(rarity => (
          <input
            key={rarity}
            className={`btn btn-soft ${btnMap[rarity] || ''}`}
            type="radio"
            name="rarity"
            aria-label={rarity}
            checked={selectedRarity === rarity}
            onChange={() => setSelectedRarity(rarity)}
          />
        ))}
      </div>

      {displayTradeups.length > 0 ? (
        displayTradeups.map((t: Tradeup) =>
          <TradeupRow
            key={t.id}
            id={t.id}
            players={t.players}
            rarity={t.rarity}
            items={t.items}
            mode={t.mode}
          />
        )
      ) : (
        <div className="card p-8 bg-base-300">
          <h1 className="font-bold text-info">No tradeups available.</h1>
        </div>
      )}
      <div className="flex flex-grow"></div>
      <Footer />
    </div>
  )
}

export default TradeupsHome
