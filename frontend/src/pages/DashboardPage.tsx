import { Routes, Route } from "react-router"
import InventoryPage from "./InventoryPage"

export default function DashboardPage() {
  return (
    <div className="gap-2 lg:flex">
      <div className="mt-2">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryPage />} />
        </Routes>
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="flex mb-5">
    </div>
  )
}
