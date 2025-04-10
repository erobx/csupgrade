import { useState, useMemo } from "react"
import { useInventory } from "../../providers/InventoryProvider"
import { Skin } from "../../types/skin"
import StatTrakBadge from "../StatTrakBadge"
import useAuth from "../../stores/authStore"
import { useNavigate } from "react-router"
import { useNotification } from "../../stores/notificationStore"

export default function TradeupModal({ tradeupId, rarity }: { tradeupId: string, rarity: string }) {
  const { loggedIn } = useAuth()
  const { inventory, setItemVisibility } = useInventory()
  const navigate = useNavigate()

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 15

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const sorted = useMemo(() => {
    if (!inventory) return
    const filtered = inventory.items.filter(i => i.data.rarity === rarity && i.visible === true)
    const pages = Math.ceil(filtered.length / itemsPerPage)
    setTotalPages(pages)

    return filtered.sort((a, b) => {
      const n1: string = a.data.name
      const n2: string = b.data.name
      return n1.localeCompare(n2)
    })
  }, [inventory])

  const currentItems = sorted?.slice(startIndex, endIndex)

  const onClick = () => {
    if (loggedIn) {
      document.getElementById('modal_add').showModal()
    } else {
      navigate("/login")
    }
  }

  return (
    <div className="h-48">
      <button className="btn btn-info" onClick={onClick}>Add Skin</button>
      <dialog id="modal_add" className="modal">
        <div className="modal-box max-w-7xl max-h-3xl md:w-fit">
          <h3 className="font-bold text-lg mb-1">Showing all available skins...</h3>
          <div className="grid grid-cols-5 grid-flow-rows md:grid-cols-3 gap-2">
          {currentItems ? (
            currentItems.map(item => (
              <ModalItem
                key={item.invId}
                invId={item.invId}
                tradeupId={tradeupId}
                skin={item.data}
                setItemVisibility={setItemVisibility}
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
  setItemVisibility: (invId: string, visible: boolean) => void;
}

function ModalItem({ invId, tradeupId, skin, setItemVisibility }: ModalItemProps) {
  const { user } = useAuth()
  const { addNotification } = useNotification()

  const addSkin = async () => {
    console.log(`adding skin ${invId} to tradeup ${tradeupId}...`)
    const jwt = localStorage.getItem("jwt")
    if (!user) return
    try {
      const res = await fetch(`http://localhost:8080/v1/tradeups/${tradeupId}/add?invId=${invId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      })

      if (res.status === 400) {
        addNotification("Reached max amount of skins contributed", "error")
        return
      }

      if (res.status !== 200) {
        addNotification("Could not add skin", "error")
        return
      }

      addNotification("Successfully added skin", "success")
      setItemVisibility(invId, false)
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
