import { useMemo } from "react"
import RarityBadge from "../components/RarityBadge"
import StatTrakBadge from "../components/StatTrakBadge"
import { outlineMap } from "../constants/constants"
import { useInventory } from "../providers/InventoryProvider"
import { Skin } from "../types/skin"

export default function InventoryPage() {
  const { inventory, removeItem } = useInventory()

  const handleFilter = () => {
  }

  const displayItems = useMemo(() => {
    if (!inventory) return []
    return inventory.items.filter((item) => item.visible)
  }, [inventory])

  if (!inventory) return <div className="loading-spinner loading-md"></div>

  return (
    <div className="flex gap-6">
      <div className="grid grid-cols-6 gap-2">
        {inventory.items.length === 0 ? (
          <h1 className="text-xl font-bold text-info">Visit the Store for more skins!</h1>
        ) : (
          displayItems.map((item) => (
            <div key={item.invId} className="card bg-base-300">
              {item.data ? (
                <InventoryItem skin={item.data} />
              ) : (
                <div className="loading-spinner loading-xl"></div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="card flex flex-col items-center text-center gap-3 bg-base-200 p-4 h-fit w-fit lg:w-[14vw]">
        <h1 className="font-bold text-lg">Settings</h1>
        <form className="filter" onClick={handleFilter}>
          <input className="btn btn-soft btn-square" type="reset" value="×"/>
          <input className="btn btn-soft btn-info" type="radio" name="frameworks" aria-label="Rarity"/>
          <input className="btn btn-soft btn-accent" type="radio" name="frameworks" aria-label="Wear"/>
          <input className="btn btn-soft btn-warning" type="radio" name="frameworks" aria-label="Price"/>
        </form>
        <div className="w-full">
          <button className="btn btn-soft btn-error w-full">Enter delete mode</button>
        </div>
      </div>

    </div>
  )
}

function InventoryItem({ skin }: { skin: Skin }) {
  const outlineColor = outlineMap[skin.rarity]

  return (
    <div
      className={`card card-xs w-54 bg-base-200 shadow-md cursor-pointer hover:outline-4 ${outlineColor}`}
    >
      <h1 className="text-primary ml-1.5">${skin.price.toFixed(2)}</h1>
      <figure>
        <div>
          <img
            alt={skin.name}
            src={skin.imgSrc}
          />
        </div>
      </figure>
      <div className="card-body items-center">
        <h1 className="card-title text-xs">{skin.name}</h1>
        <h2 className="card-title text-xs">({skin.wear})</h2>
        <div className="flex gap-2">
          <div>
            <RarityBadge
              rarity={skin.rarity}
            />
          </div>
          {skin.isStatTrak && <StatTrakBadge />}
        </div>
      </div>
    </div>
  )
}
