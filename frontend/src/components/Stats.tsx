import { useState, useEffect } from "react"
import { User } from "../types/user"
import RarityBadge from "./RarityBadge"
import StatTrakBadge from "./StatTrakBadge"
import { Skin } from "../types/skin"

export default function Stats({ user }: { user: User }) {
  const [winnings, setWinnings] = useState<Skin[]>([])
  const [entered, setEntered] = useState(0)
  const [won, setWon] = useState(0)
  const [earnings, setEarnings] = useState(0)
  
  const fetchStats = async () => {
    const jwt: any = localStorage.getItem("jwt")
    try {
      const res = await fetch(`http://localhost:8080/v1/users/${user.id}/stats`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt}`,
        }
      })
      const data = await res.json()
      if (data) {
        setEntered(data.tradeupsEntered)
        setWon(data.tradeupsWon)
        if (data.recentWinnings) {
          setWinnings(data.recentWinnings)
        }
      }
    } catch (error) {
      console.error("Error fetching stats: ", error)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])
  
  return (
    <div className="flex flex-col items-center">
      <div className="stats bg-base-300 shadow-md">
        <div className="stat">
          <div className="stat-title">Recent winnings</div>
          <div className="flex">
            {winnings.length === 0 ? (
              <div>No winnings</div>
            ) : (
              winnings.map((skin, index) => (
                <StatItem
                  key={index}
                  name={skin.name}
                  wear={skin.wear}
                  rarity={skin.rarity}
                  isStatTrak={skin.isStatTrak}
                  imgSrc={skin.imgSrc}
                  price={skin.price}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <div className="stats bg-base-300 shadow-md">
        <div className="stat place-items-center">
          <div className="stat-title">Trade Ups Entered</div>
          <div className="stat-value text-primary">{entered}</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title">Trade Ups Won</div>
          <div className="stat-value text-accent">{won}</div>
        </div>

        <div className="stat place-items-center">
          <div className="stat-title">Total Earnings</div>
          <div className="stat-value text-primary">${earnings}</div>
        </div>
      </div>
    </div>
  )
}

type StatItemProps = {
  name: string;
  wear: string;
  rarity: string;
  isStatTrak: boolean;
  imgSrc: string;
  price: number;
}

function StatItem({ name, wear, rarity, isStatTrak, imgSrc, price }: StatItemProps) {
  return (
    <div className="card card-xs w-48">
      <h1 className="ml-1.5">${price.toFixed(2)}</h1>
      <figure>
        <div>
          <img
            alt={imgSrc}
            src={imgSrc}
            width={100}
            height={50}
          />
        </div>
      </figure>
      <div className="card-body items-center">
        <h1 className="card-title text-sm">{name}</h1>
        <h1 className="card-title text-xs">({wear})</h1>
        <div className="flex gap-2">
          <div>
            <RarityBadge
              rarity={rarity}
            />
          </div>
          {isStatTrak && <StatTrakBadge />}
        </div>
      </div>
    </div>
  )
}
