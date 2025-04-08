import { useWS } from "../providers/WebSocketProvider"
import TradeupGrid from "../components/Tradeups/TradeupGrid"
import CountdownTimer from "../components/CountdownTimer"
import { useEffect, useMemo } from "react"
import { useNavigate, useParams } from "react-router"

function TradeupDetails() {
  const params = useParams()
  const navigate = useNavigate()
  const tradeupId = params.tradeupId
  const { currentTradeup, subscribeToTradeup } = useWS()
  const textColor: string = ""

  useEffect(() => {
    if (tradeupId) subscribeToTradeup(tradeupId)
  }, [tradeupId])

  const sortedItems = useMemo(() => {
    if (!currentTradeup) return
    return currentTradeup.items.sort((a, b) => parseInt(a.invId) - parseInt(b.invId))
  }, [currentTradeup])

  return (
    <div>
      <div className="fixed ml-6">
        <button className="btn btn-accent" onClick={() => navigate("/tradeups")}>Back to Tradeups</button>
      </div>
      {currentTradeup && sortedItems ? (
        <div className="flex flex-col items-center gap-2 mt-5">
          <div className="flex items-center gap-5">
            <span className={`font-bold text-2xl ${textColor}`}>{currentTradeup.rarity}</span>
            <span className="font-bold">—</span>
            <span className="font-bold text-2xl text-info">{currentTradeup.status}</span>
          </div>
          {currentTradeup.items.length === 10 && currentTradeup.status !== 'Completed' && (
            <div className="font-bold text-lg">Tradeup Closes In: <CountdownTimer stopTime={currentTradeup.stopTime} /></div>
            )}
          <TradeupGrid
            tradeupId={currentTradeup.id}
            rarity={currentTradeup.rarity}
            items={sortedItems}
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
