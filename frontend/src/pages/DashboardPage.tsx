import { Routes, Route } from "react-router"
import InventoryPage from "./InventoryPage"
import DashboardDrawer from "../components/DashboardDrawer"
import RecentTradeups from "../components/RecentTradeups"
import Stats from "../components/Stats"
import useAuth from "../stores/authStore"
import Settings from "./Settings"

export default function DashboardPage() {
  return (
    <div className="gap-2 lg:flex">
      <DashboardDrawer />
      <div className="mt-2">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
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
    <div className="flex justify-center mb-5">
      <RecentTradeups user={user} />
      <div className="divider lg:divider-horizontal"></div>
      <Stats user={user} />
    </div>
  )
}
