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
import StorePage from './pages/StorePage'
import Navbar from './components/Navbar'
import useAuth from './stores/authStore'
import { useEffect, useState } from 'react'

export default function App() {
  const { loggedIn, setUser, setLoggedIn } = useAuth()
  const [userID, setUserID] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      setLoading(true)
      const jwt = localStorage.getItem("jwt")
      if (jwt) {
        const res = await fetch(`http://localhost:8080/v1/users`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${jwt}`
          }
        })
        const data = await res.json()
        setUser(data.user)
        setUserID(data.user.id)
        setLoggedIn(true)
      }
      setLoading(false)
    }

    fetchUser()
  },[])

  if (loading) {
    return (
      <div className='loading-spinner loading-xs'></div>
    )
  }

  return (
    <InventoryProvider userId={userID}>
      <WebSocketProvider userId={userID}>
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
            <Route path="store" element={<StorePage />} />
          </Routes>
      </WebSocketProvider>
    </InventoryProvider>
  )
}
