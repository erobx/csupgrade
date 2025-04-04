import { useWS } from "../providers/WebSocketProvider"
import TradeupGrid from "../components/Tradeups/TradeupGrid"
import CountdownTimer from "../components/CountdownTimer"

function TradeupDetails() {
  const { currentTradeup } = useWS()
  const textColor: string = ""

  return (
    <div>
      {currentTradeup ? (
        <div className="flex flex-col items-center gap-2 mt-5">
          <div className="flex items-center gap-5">
            <span className={`font-bold text-2xl ${textColor}`}>{currentTradeup.rarity}</span>
            <span className="font-bold">—</span>
            <span className="font-bold text-2xl text-info">{currentTradeup.status}</span>
          </div>
          {currentTradeup.items.length === 10 && currentTradeup.status === 'Active' && (
            <div className="font-bold text-lg">Tradeup Closes In: <CountdownTimer /></div>
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
