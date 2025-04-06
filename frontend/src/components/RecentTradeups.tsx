import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { User } from "../types/user"
import { Skin } from "../types/skin"

type Row = {
  tradeupId: string;
  rarity: string;
  status: string;
  skins: Skin[];
  value: number;
}

export default function RecentTradeups({ user }: { user: User }) {
  const [rows, setRows] = useState<Row[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRecentTradeups = async () => {
    try {
      setIsLoading(true)
      const jwt: any = localStorage.getItem("jwt")
      const res = await fetch(`http://localhost:8080/v1/users/${user.id}/recents`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        }
      })

      const data = await res.json()
      if (data) {
        setRows(data)
      }
    } catch (error: any) {
      console.error("Failed to fetch recent tradeups: ", error);
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRecentTradeups()
  }, [])

  if (isLoading) {
    return (
      <div className="w-fit bg-base-300 rounded-box shadow-md">
        <div className="p-4 text-center">Loading trade ups...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-fit bg-base-300 rounded-box shadow-md">
        <div className="p-4 text-red-500">Error: {error}</div>
      </div>
    )
  }

  if (rows.length === 0) {
    return (
      <div className="w-fit bg-base-300 rounded-box shadow-md">
        <div className="p-4 text-center">No recent trade ups found</div>
      </div>
    )
  }

  return (
    <div className="w-fit bg-base-300 rounded-box shadow-md">
      <ul className="list">
        <div className="flex items-center">
          <li className="p-4 pb-2 text-sm opacity-70 tracking-wide">Recent Trade Ups</li>
        </div>
        {rows.map((r, index) => (
          <ListRow
            key={index}
            tradeupId={r.tradeupId}
            rarity={r.rarity}
            status={r.status}
            skins={r.skins}
            value={r.value}
          />
        ))}
      </ul>
    </div>
  )
}

type ListRowProps = {
  tradeupId: string;
  rarity: string;
  status: string;
  skins: Skin[];
  value: number;
}

function ListRow({ tradeupId, rarity, status, skins, value }: ListRowProps) {
  const navigate = useNavigate()
  //const textColor = textMap[rarity]
  const textColor: string = ""
  const [statusColor, setStatusColor] = useState("")

  useEffect(() => {
    switch (status) {
      case "Active":
        setStatusColor("text-info")
        break
      case "Completed":
        setStatusColor("text-success")
        break
      default:
        setStatusColor("text-accent")
    }
  }, [status])

  return (
    <li className="list-row">
      <div>
        <div className="font-bold">Rarity</div>
        <div className={`${textColor} font-bold`}>{rarity}</div>
      </div>

      <div>
        <div className="font-bold">Status</div>
        <div className={`${statusColor} font-bold`}>{status}</div>
      </div>

      <div className="min-w-[300px] max-h-[100px] overflow-y-auto">
        <div className="font-bold sticky top-0 bg-base-300 z-10 pb-2">Skins Invested</div>
        {skins.map((s, index) => (
          <div
            key={index}
            className={`
              ${index % 2 === 0 ? 'text-accent' : ''}
            `}>
            {s.name} ({s.wear})
          </div>
        ))}
      </div>

      <div className="ml-10 mr-10">
        <div className="font-bold">Value</div>
        <div className="font-bold text-primary">${value.toFixed(2)}</div>
      </div>

      <div className="mr-8">
        <button className="btn btn-soft btn-warning" 
          onClick={() => navigate(`/tradeups/${tradeupId}`)}
        >
          View
        </button>
      </div>
    </li>
  )
}
