import { Routes, Route } from "react-router"
import InventoryPage from "./InventoryPage"
import DashboardDrawer from "../components/DashboardDrawer"
import RecentTradeups from "../components/RecentTradeups"
import Stats from "../components/Stats"
import useAuth from "../stores/authStore"
import Settings from "./Settings"

export default function DashboardPage() {
  return (
    <div className="flex gap-2">
      <DashboardDrawer />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}

function Dashboard() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="loading-spinner loading-md"></div>
    )
  }

  return (
    <div className="flex lg:flex-row sm:flex-col mt-5 m-auto">
      <RecentTradeups user={user} />
      <div className="divider lg:divider-horizontal"></div>
      <Stats user={user} />
    </div>
  )
}
