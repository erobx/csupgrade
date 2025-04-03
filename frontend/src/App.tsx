import { Routes, Route } from 'react-router'
import { WebSocketProvider } from './providers/WebSocketProvider'
import { InventoryProvider } from './providers/InventoryProvider'
import Home from './pages/Home'
import TradeupsHome from './pages/TradeupsHome'
import TradeupDetails from './pages/TradeupDetails'
import InventoryPage from './pages/InventoryPage'
import Navbar from './components/Navbar'

function App() {
  const userId = "test"
  return (
    <InventoryProvider userId={userId}>
      <WebSocketProvider userId={userId}>
        <Navbar />
        <Routes>
          <Route index element={<Home />} />
          <Route path="tradeups">
            <Route index element={<TradeupsHome />} />
            <Route path=":tradeupId" element={<TradeupDetails />} />
          </Route>
          <Route path="inventory" element={<InventoryPage />} />
        </Routes>
      </WebSocketProvider>
    </InventoryProvider>
  )
}

export default App
