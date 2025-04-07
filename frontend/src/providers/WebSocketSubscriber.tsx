import { useEffect } from "react";
import { useWS } from "./WebSocketProvider";
import { useLocation, useParams } from "react-router";

export function WebSocketSubscriber() {
  const { pathname } = useLocation();
  const { tradeupId } = useParams();
  const { subscribeToAll, subscribeToTradeup, unsubscribe, isConnected } = useWS();

  useEffect(() => {
    if (!isConnected) return

    //unsubscribe(); // Unsubscribe before subscribing to new state

    const urlTradeupId = location.pathname.match(/\/tradeups\/([^\/]+)/)?.[1]

    if (urlTradeupId) {
      subscribeToTradeup(urlTradeupId);
    } else if (pathname === "/tradeups") {
      subscribeToAll();
    }

    return () => {
      unsubscribe(); // Cleanup when component unmounts
    };
  }, [pathname, tradeupId, isConnected]);

  return null;
}

