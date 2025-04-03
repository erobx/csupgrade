import { useInventory } from "../providers/InventoryProvider"

export default function InventoryPage() {
  const { inventory, removeItem } = useInventory()

  if (!inventory) return <p>Loading inventory...</p>

  return (
    <div className="flex flex-col items-center mt-5 gap-2">
      <h1 className="font-bold">{inventory.userId}'s Inventory</h1>
      <div className="flex gap-2">
        {inventory.items
          .filter((item) => item.visible) // Hide tradeup skins
          .map((item) => (
            <div key={item.invId} className="card bg-base-300">
              {item.skin ? (
                <div className="card-body">
                  <h3>{item.skin.name}</h3>
                  <p>Wear: {item.skin.wearName}</p>
                  <p>Price: ${item.skin.price.toFixed(2)}</p>
                  <button className="btn btn-soft" onClick={() => removeItem(item.invId)}>Delete</button>
                </div>
              ) : (
                <p>No skin data available</p>
              )}
            </div>
          ))}
      </div>
    </div>
  )

}
