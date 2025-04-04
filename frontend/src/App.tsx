import { Routes, Route } from 'react-router'
import { WebSocketProvider } from './providers/WebSocketProvider'
import { InventoryProvider } from './providers/InventoryProvider'
import { WebSocketSubscriber } from './providers/WebSocketSubscriber'
import Home from './pages/Home'
import SignUpLogin from './pages/SignUpLogin'
import TradeupsHome from './pages/TradeupsHome'
import TradeupDetails from './pages/TradeupDetails'
import InventoryPage from './pages/InventoryPage'
import DashboardPage from './pages/DashboardPage'
import Navbar from './components/Navbar'
import useAuth from './stores/authStore'

export default function App() {
  const userId = "test"
  const { loggedIn } = useAuth()
  return (
    <InventoryProvider userId={userId}>
      <WebSocketProvider userId={userId}>
          <WebSocketSubscriber />
          <Navbar />
          <Routes>
            <Route index element={<Home />} />
            <Route path="/login/*" element={loggedIn ? <DashboardPage /> : <SignUpLogin />} />
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
