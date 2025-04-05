import { useInventory } from "../providers/InventoryProvider"

export default function InventoryPage() {
  const { inventory, removeItem } = useInventory()

  if (!inventory) return <div className="loading-spinner loading-md"></div>

  return (
    <div className="flex flex-col items-center mt-2 gap-2">
      <div className="flex gap-2">
        {inventory.items.length === 0 ? (
          <h1 className="text-xl font-bold text-info">Visit the Store for more skins!</h1>
        ) : (
          inventory.items
            .filter((item) => item.visible) // Hide tradeup skins
            .map((item) => (
              <div key={item.invId} className="card bg-base-300">
                {item.data? (
                  <div className="card-body">
                    <h3>{item.data.name}</h3>
                    <p>Wear: {item.data.wear}</p>
                    <p>Price: ${item.data.price.toFixed(2)}</p>
                    <button className="btn btn-soft" onClick={() => removeItem(item.invId)}>Delete</button>
                  </div>
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
