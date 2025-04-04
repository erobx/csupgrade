import { InventoryItem } from "../../types/inventory";
import { Skin } from "../../types/skin";
import TradeupModal from "./TradeupModal"

type TradeupGridProps = {
  tradeupId: string;
  rarity: string;
  items: InventoryItem[];
  status: string;
}

export default function TradeupGrid({ tradeupId, rarity, items, status}: TradeupGridProps) {
  const skins: Skin[] = items.filter(item => 
    item.data && typeof item.data === 'object' && 'id' in item.data &&
      'name' in item.data && 'rarity' in item.data)
    .map(item => item.data as Skin)

  const invIds: string[] = items.map(item => item.invId)

  return (
    <div className="grid grid-cols-5 grid-rows-2 rounded mt-5 gap-2">
      {skins.map((skin, index) => (
        <GridItem 
          invId={invIds[index]}
          tradeupId={tradeupId}
          name={skin.name}
          wear={skin.wear}
          price={skin.price.toFixed(2)}
          isStatTrak={skin.isStatTrak}
          imgSrc={skin.imgSrc}
          owned={true}
          status={status}
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
}

function GridItem({ invId, tradeupId, name, wear, price, isStatTrak, imgSrc, owned, status}: GridItemProps) {
  const outlineColor = owned ? "outline-accent" : "outline-error"

  const onSelect = () => {
    if (owned && status === "Active") {
      document.getElementById(`modal_${invId}`).showModal()
    }
  }

  return (
    <div
      className={`card card-xs w-48 bg-base-200 shadow-md m-0.5 hover:outline-4 hover:cursor-pointer ${outlineColor}`}
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
          {/*<img
            alt={name}
            src={imgSrc}
          />
          */}
        </div>
      </figure>
      <div className="card-body items-center">
        <h1 className="card-title text-sm">{name}</h1>
        <h1 className="card-title text-sm">({wear})</h1>
        <div className="flex gap-2">
          {/*isStatTrak && <StatTrakBadge />*/}
        </div>
      </div>
      <Modal invId={invId} tradeupId={tradeupId} />
    </div>
  )
}

function Modal({ invId, tradeupId }: { invId: string, tradeupId: string }) {
  const onClick = async () => {
    //const jwt = localStorage.getItem("jwt")
    //const data = await removeSkinFromTradeup(jwt, invId, tradeupId)
    //if (data) {
    //  addItem(data)
    //} else {
    //  return
    //}
    console.log(`Removed skin ${invId} from tradeup ${tradeupId}`)

    // add item back to inventory
    //addItem()
  }

  return (
    <dialog id={`modal_${invId}`} className="modal">
      <div className="modal-box max-h-3xl">
        <h3 className="font-bold text-lg mb-2">Remove skin from Tradeup?</h3>
        <button className="btn btn-error" onClick={onClick}>Remove skin</button>
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
