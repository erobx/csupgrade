import { useState } from "react"
import RarityBadge from "../components/RarityBadge"
import StatTrakBadge from "../components/StatTrakBadge"
import PageSelector from "../components/PageSelector"
import { useInventory } from "../providers/InventoryProvider"
import { Skin } from "../types/skin"
import { rarityOrder } from "../constants/constants"
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

  const getSortedItems = () => {
    if (!inventory) return []
    const sorted = [...inventory.items]
    sorted.sort((a, b) => {
      switch (filter) {
        case "Rarity":
          return rarityOrder.indexOf(b.data.rarity) - rarityOrder.indexOf(a.data.rarity)
        case "Wear":
          return a.data.float - b.data.float
        case "Price":
          return b.data.price - a.data.price
        case "A-Z":
          const n1: string = a.data.name
          const n2: string = b.data.name
          return n1.localeCompare(n2)
        default:
          const aDate = new Date(a.data.createdAt)
          const bDate = new Date(b.data.createdAt)
          return bDate.getTime() - aDate.getTime()
      }
    })
    return sorted
  }

  const sortedItems = getSortedItems()

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = sortedItems.slice(startIndex, endIndex)
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (!inventory) return <div className="loading-spinner loading-md"></div>

  return (
    <div className="flex lg:flex-row gap-6 items-center md:flex-col lg:items-start md:w-fit md:m-auto md:mt-5">
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
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

      <div className="card flex flex-col items-center text-center gap-3 bg-base-300 p-4 h-fit w-full lg:w-fit md:mb-4">
        <h1 className="font-bold text-lg">Filters</h1>
        <form className="filter" onClick={handleFilter}>
          <input className="btn btn-square" type="reset" value="×"/>
          <input className="btn btn-neutral" type="radio" name="frameworks" aria-label="Rarity"/>
          <input className="btn btn-neutral" type="radio" name="frameworks" aria-label="Wear"/>
          <input className="btn btn-neutral" type="radio" name="frameworks" aria-label="Price"/>
          <input className="btn btn-neutral" type="radio" name="frameworks" aria-label="A-Z"/>
        </form>
        <div className="w-full">
          <button className="btn btn-error w-full">Enter delete mode</button>
        </div>
      </div>

      <div className="fixed bottom-4 right-8 z-30">
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
  return (
    <div
      className={`card card-xs w-54 bg-base-300 shadow-sm cursor-pointer hover:shadow-xl hover:shadow-accent`}
    >
      {skin.price !== 0 ? (
        <h1 className="font-bold text-accent ml-1.5">${skin.price.toFixed(2)}</h1>
      ) : (
        <h1 className="font-bold text-accent ml-1.5">N/A</h1>
      )}
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
