import { useWS } from "../providers/WebSocketProvider"
import { useParams } from "react-router"
import { useEffect } from "react"
import TradeupGrid from "../components/Tradeups/TradeupGrid"

function TradeupDetails() {
  const { tradeupId } = useParams<{ tradeupId: string}>()
  const { currentTradeup, subscribeToTradeup, unsubscribe } = useWS()
  const textColor: string = ""

  useEffect(() => {
    if (tradeupId) {
      subscribeToTradeup(tradeupId)
    }

    return () => {
      unsubscribe()
    }
  }, [tradeupId])

  return (
    <div className="flex flex-col items-center gap-2 mt-5">
      {currentTradeup ? (
        <div>
          <div className="flex items-center gap-5">
            <span className={`font-bold text-2xl ${textColor}`}>{currentTradeup.rarity}</span>
            <span className="font-bold">—</span>
            <span className="font-bold text-2xl text-info">{currentTradeup.status}</span>
          </div>
          {currentTradeup.items.length === 10 && currentTradeup.status === 'Active' && (
            <div className="font-bold text-lg">Tradeup Closes In: 5:00</div>
          )}
          <TradeupGrid
            tradeupId={currentTradeup.id}
            rarity={currentTradeup.rarity}
            items={currentTradeup.items}
            status={currentTradeup.status}
          />
        </div>
      ) : (
        <div className="loading-spinner loading-xl"></div>
      )}
    </div>
  )
}

export default TradeupDetails
