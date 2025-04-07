import { useWS } from "../providers/WebSocketProvider"
import TradeupGrid from "../components/Tradeups/TradeupGrid"
import CountdownTimer from "../components/CountdownTimer"
import { useEffect } from "react"
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

  return (
    <div>
      <div className="fixed ml-6">
        <button className="btn btn-accent" onClick={() => navigate("/tradeups")}>Back to Tradeups</button>
      </div>
      {currentTradeup ? (
        <div className="flex flex-col items-center gap-2 mt-5">
          <div className="flex items-center gap-5">
            <span className={`font-bold text-2xl ${textColor}`}>{currentTradeup.rarity}</span>
            <span className="font-bold">—</span>
            <span className="font-bold text-2xl text-info">{currentTradeup.status}</span>
          </div>
          {currentTradeup.items.length === 10 && currentTradeup.status !== 'Completed' ? (
            <div className="font-bold text-lg">Tradeup Closes In: <CountdownTimer stopTime={currentTradeup.stopTime} /></div>
            ) : (
            <div className="font-bold text-lg">Tradeup Countdown:
              <div className="flex space-x-4 bg-base-100 p-4 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">5</div>
                  <div className="text-xs">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">00</div>
                  <div className="text-xs">Seconds</div>
                </div>
              </div>
            </div>
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
