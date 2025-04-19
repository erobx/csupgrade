import { useInventory } from "../../providers/InventoryProvider";
import { useNotification } from "../../stores/notificationStore";
import { InventoryItem } from "../../types/inventory";
import { Skin } from "../../types/skin";
import StatTrakBadge from "../StatTrakBadge";
import TradeupModal from "./TradeupModal"

type TradeupGridProps = {
  tradeupId: string;
  rarity: string;
  items: InventoryItem[];
  status: string;
}

export default function TradeupGrid({ tradeupId, rarity, items, status}: TradeupGridProps) {
  const { ownsItem, setItemVisibility } = useInventory()

  const skins: Skin[] = items.filter(item => 
    item.data && typeof item.data === 'object' && 'id' in item.data &&
      'name' in item.data && 'rarity' in item.data)
    .map(item => item.data as Skin)

  const invIds: string[] = items.map(item => item.invId)
  const owernship: boolean[] = items.map(item => ownsItem(item.invId))

  return (
    <div className="grid lg:grid-cols-5 grid-flow-row md:grid-cols-4 rounded mt-5 gap-2">
      {skins.map((skin, index) => (
        <GridItem 
          key={invIds[index]}
          invId={invIds[index]}
          tradeupId={tradeupId}
          name={skin.name}
          wear={skin.wear}
          price={skin.price.toFixed(2)}
          isStatTrak={skin.isStatTrak}
          imgSrc={skin.imgSrc}
          owned={owernship[index]}
          status={status}
          setItemVisibility={setItemVisibility}
        />
      ))}
      {items.length < 10 && (
        Array.from({ length: 10 - items.length }).map((_, index) => (
          <EmptyGridItem key={`empty-${index}`} tradeupId={tradeupId} rarity={rarity} />
      )))}
    </div>
  )
}

type GridItemProps = {
  invId: string;
  tradeupId: string;
  name: string;
  wear: string;
  price: string;
  isStatTrak: boolean;
  imgSrc: string;
  owned: boolean;
  status: string;
  setItemVisibility: (invId: string, visible: boolean) => void;
}

function GridItem({ invId, tradeupId, name, wear, price, isStatTrak, imgSrc, owned, status, setItemVisibility }: GridItemProps) {
  const shadowColor = owned ? "shadow-accent" : "shadow-error"
  const cursor = owned ? "cursor-pointer" : "";

  const onSelect = () => {
    if (owned && status !== "Completed") {
      document.getElementById(`modal_${invId}`).showModal()
    }
  }

  return (
    <div
      className={`card card-xs w-48 bg-base-200 shadow-md m-0.5 hover:shadow-lg hover:${shadowColor} hover:${cursor}`}
      onClick={onSelect}
    >
      {owned ? (
      <div className="grid grid-cols-3">
        <h1 className="text-primary font-bold m-auto ml-3">${price}</h1>
        <div></div>
        <div className="status status-lg status-accent animate-pulse m-auto mr-3"></div>
      </div>
      ) : (
        <h1 className="text-primary ml-2">${price}</h1>
      )}
      <figure>
        <div>
          <img
            alt={name}
            src={imgSrc}
          />
        </div>
      </figure>
      <div className="card-body items-center">
        <h1 className="card-title text-sm">{name}</h1>
        <h1 className="card-title text-sm">({wear})</h1>
        <div className="flex gap-2">
          {isStatTrak && <StatTrakBadge />}
        </div>
      </div>
      <Modal invId={invId} tradeupId={tradeupId} setItemVisibility={setItemVisibility} />
    </div>
  )
}

type ModalProps = {
  invId: string;
  tradeupId: string;
  setItemVisibility: (invId: string, visible: boolean) => void;
}

function Modal({ invId, tradeupId, setItemVisibility }: ModalProps) {
  const { addNotification } = useNotification()

  const onClick = async () => {
    const jwt = localStorage.getItem("jwt")
    try {
      const res = await fetch(`http://localhost:8080/v1/tradeups/${tradeupId}/remove?invId=${invId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${jwt}`,
        }
      })
      
      if (res.status !== 200) {
        addNotification("Could not remove skin", "error")
        return
      }
      
      addNotification("Successfully removed skin", "success")
      setItemVisibility(invId, true)
    } catch(error) {
      console.error("Error removing skin from tradeup:", error)
    }
  }

  return (
    <dialog id={`modal_${invId}`} className="modal">
      <div className="modal-box max-h-3xl">
        <h3 className="font-bold text-lg mb-2">Remove skin from Tradeup?</h3>
        <form method="dialog">
          <button className="btn btn-error" onClick={onClick}>Remove skin</button>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}

function EmptyGridItem({ tradeupId, rarity }: { tradeupId: string, rarity: string }) {
  return (
    <div className="card card-xs w-48 bg-base-200 shadow-md m-0.5">
      <div className="card-body items-center">
        <div className="card-actions mt-12">
          <TradeupModal tradeupId={tradeupId} rarity={rarity} />
        </div>
      </div>
    </div>
  )
}
