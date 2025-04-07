import { useState, useMemo } from "react"
import { useInventory } from "../../providers/InventoryProvider"
import { Skin } from "../../types/skin"
import StatTrakBadge from "../StatTrakBadge"
import useAuth from "../../stores/authStore"
import { useNavigate } from "react-router"

export default function TradeupModal({ tradeupId, rarity }: { tradeupId: string, rarity: string }) {
  const { loggedIn } = useAuth()
  const { inventory, removeItem } = useInventory()
  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 15

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const filtered = useMemo(() => {
    if (!inventory) return
    const temp = inventory.items.filter(i => i.data.rarity === rarity)
    const pages = Math.ceil(temp.length / itemsPerPage)
    setTotalPages(pages)

    return inventory.items.filter(i => i.data.rarity === rarity)
  }, [inventory])

  const currentItems = filtered?.slice(startIndex, endIndex)

  const onClick = () => {
    if (loggedIn) {
      document.getElementById('modal_add').showModal()
    } else {
      navigate("/login")
    }
  }

  return (
    <div className="h-48">
      <button className="btn btn-primary" onClick={onClick}>Add Skin</button>
      <dialog id="modal_add" className="modal">
        <div className="modal-box max-w-7xl max-h-3xl">
          <h3 className="font-bold text-lg mb-1">Showing all available skins...</h3>
          <div className="grid grid-cols-5 grid-rows-3 gap-2">
          {currentItems ? (
            currentItems.map(item => (
              <ModalItem
                invId={item.invId}
                tradeupId={tradeupId}
                skin={item.data}
                removeItem={removeItem}
              />
            ))
            ) : (
              <div>
                  <h1>No skins to add</h1>
              </div>
          )}
          </div>
          <div className="join mt-1">
            <button className="join-item btn" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>«</button>
            <button className="join-item btn">Page {currentPage}</button>
            <button className="join-item btn" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>»</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  )
}

type ModalItemProps = {
  invId: string;
  tradeupId: string;
  skin: Skin;
  removeItem: (invId: string) => void;
}

function ModalItem({ invId, tradeupId, skin, removeItem }: ModalItemProps) {
  const { user } = useAuth()

  const addSkin = async () => {
    console.log(`adding skin ${invId} to tradeup ${tradeupId}...`)
    const jwt = localStorage.getItem("jwt")
    if (!user) return
    try {
      const res = await fetch(`http://localhost:8080/v1/tradeups/${tradeupId}?invId=${invId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      })
      if (res.status !== 200) {
        return
      }
      removeItem(invId)
    } catch (error) {
      console.error("Error: ", error)
    }
  }

  return (
    <div className={`card card-md w-56 h-48 bg-base-300 hover:border-4 hover:cursor-pointer`} onClick={addSkin}>
      <h1 className="text-sm font-bold text-primary ml-1.5 mt-0.5">${skin.price.toFixed(2)}</h1>
      <figure>
        <div>
          <img
            alt={skin.name}
            src={skin.imgSrc}
            width={100}
            height={50}
          />
        </div>
      </figure>
      <div className="card-body items-center">
        <h1 className="card-title text-sm">{skin.name}</h1>
        <h1 className="card-title text-xs">({skin.wear})</h1>
        <div className="flex gap-2">
          {skin.isStatTrak && <StatTrakBadge />}
        </div>
      </div>
    </div>
  )
}
