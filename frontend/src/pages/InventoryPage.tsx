import RarityBadge from "../components/RarityBadge"
import StatTrakBadge from "../components/StatTrakBadge"
import { outlineMap } from "../constants/constants"
import { useInventory } from "../providers/InventoryProvider"
import { Skin } from "../types/skin"

export default function InventoryPage() {
  const { inventory, removeItem } = useInventory()

  if (!inventory) return <div className="loading-spinner loading-md"></div>

  return (
    <div className="flex flex-col items-center mt-2 gap-2">
      <div className="grid grid-cols-6 gap-2">
        {inventory.items.length === 0 ? (
          <h1 className="text-xl font-bold text-info">Visit the Store for more skins!</h1>
        ) : (
          inventory.items
            .filter((item) => item.visible) // Hide tradeup skins
            .map((item) => (
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
