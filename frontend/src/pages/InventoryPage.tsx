import { useMemo, useState } from "react"
import RarityBadge from "../components/RarityBadge"
import StatTrakBadge from "../components/StatTrakBadge"
import PageSelector from "../components/PageSelector"
import { outlineMap } from "../constants/constants"
import { useInventory } from "../providers/InventoryProvider"
import { Skin } from "../types/skin"
import { rarityOrder, wearOrder } from "../constants/constants"
import useAuth from "../stores/authStore"

export default function InventoryPage() {
  const { inventory, removeItem } = useInventory()
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState("")
  const itemsPerPage = 18

  const handleFilter = (e: any) => {
    const label = e.target.getAttribute('aria-label')
    setFilter(label || "")
    setCurrentPage(1)
  }

  const sortedItems = useMemo(() => {
    if (!inventory) return []
    const sorted = [...inventory.items]
    sorted.sort((a, b) => {
      switch (filter) {
        case "Rarity":
          return rarityOrder.indexOf(a.data.rarity) - rarityOrder.indexOf(b.data.rarity)
        case "Wear":
          return a.data.float - b.data.float
        case "Price":
          return a.data.price - b.data.price
        default:
          return b.data.createdAt - a.data.createdAt
      }
    })
    return sorted
  }, [inventory, filter])

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = sortedItems.slice(startIndex, endIndex)
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (!inventory) return <div className="loading-spinner loading-md"></div>

  return (
    <div className="flex gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
        {inventory.items.length === 0 ? (
          <h1 className="text-xl font-bold text-info">Visit the Store for more skins!</h1>
        ) : (
          currentItems.map((item) => (
            <div key={item.invId} className="card bg-base-300">
              {item.data ? (
                <div key={item.invId} className="item" onClick={() => document.getElementById(`modal_${item.invId}`).showModal()}>
                  <InventoryItem skin={item.data} />
                  <ItemModal
                    invId={item.invId}
                    skin={item.data}
                    removeItem={removeItem}
                  />
                </div>
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

      <div className="fixed bottom-4 right-8 z-50">
        <div className="join">
          <button className="join-item btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>«</button>
          <div className="join-item btn"> 
            <PageSelector totalPages={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
          </div>
          <button className="join-item btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>»</button>
        </div>
      </div>
    </div>
  )
}

function InventoryItem({ skin }: { skin: Skin }) {
  const outlineColor = outlineMap[skin.rarity]

  return (
    <div
      className={`card card-xs w-54 bg-base-300 shadow-md cursor-pointer hover:outline-4 ${outlineColor}`}
    >
      <h1 className="font-bold text-accent ml-1.5">${skin.price.toFixed(2)}</h1>
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

function ItemModal({ invId, skin, removeItem }: { invId: string, skin: Skin, removeItem: (invId: string) => void }) {
  const { user } = useAuth()

  const onClick = async () => {
    const jwt = localStorage.getItem("jwt")
    const res = await fetch("")
    if (res.status !== 204) {
      return
    }
    removeItem(invId)
    console.log("deleted: ", invId)
  }

  const createdAt = new Date(skin.createdAt.toString().replace("Z", "")).toDateString()

  return (
    <dialog id={`modal_${invId}`} className="modal">
      <div className="modal-box max-h-3xl">
        <div className="flex flex-col items-center gap-2">
          <h3 className="font-bold text-lg mb-1">Details</h3>
          <h1 className="font-bold">Name: {skin.name}</h1>
          <h1 className="font-bold">Wear: {skin.wear}</h1>
          <h1 className="font-bold">Rarity: {skin.rarity}</h1>
          <h1 className="font-bold">Price: ${skin.price}</h1>
          <h1 className="font-bold">Float: {skin.float}</h1>
          {skin.isStatTrak ? (
            <h1 className="font-bold">StatTrak: Yes</h1>
          ) : (
            <h1 className="font-bold">StatTrak: No</h1>
          )}
          <h1 className="font-bold">Collection: {skin.collection}</h1>
          <h1 className="font-bold">Added: {createdAt}</h1>
          <div></div>
          <form method="dialog">
            <button className="btn btn-error" onClick={onClick}>Delete skin</button>
          </form>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}
