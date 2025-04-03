import { useWS } from "../providers/WebSocketProvider"
import { useParams } from "react-router"
import { useEffect } from "react"

function TradeupDetails() {
  const { tradeupId } = useParams<{ tradeupId: string}>()
  const { currentTradeup, subscribeToTradeup, unsubscribe } = useWS()

  useEffect(() => {
    if (tradeupId) {
      subscribeToTradeup(tradeupId)
    }

    return () => {
      unsubscribe()
    }
  }, [tradeupId])

  return (
    <div className="flex flex-col items-center mt-5">
      <h1 className="font-bold text-3xl">Tradeup Details</h1>
      {currentTradeup ? (
        <p>{currentTradeup.rarity}</p>
      ) : (
        <p>Loading tradeup details...</p>
      )}
    </div>
  )
}

export default TradeupDetails
