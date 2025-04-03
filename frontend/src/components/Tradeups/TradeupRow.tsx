import { useNavigate } from "react-router";
import { InventoryItem } from "../../types/inventory"
import ImageCarousel from "../ImageCarousel";
import { Skin } from "../../types/skin";

interface TradeupRowProps {
  id: string;
  players: any[];
  rarity: string;
  items: InventoryItem[];
  status: string;
}

export default function TradeupRow({ id, players, rarity, items, status }: TradeupRowProps) {
  const dividerColor: string = ""
  const totalPrice: number = 0

  const skins: Skin[] = items.filter(item =>
    item.data && typeof item.data === 'object' && 'id' in item.data &&
    'name' in item.data && 'rarity' in item.data).map(item => item.data as Skin)

  return (
    <div className="join bg-base-300 border-6 border-base-200 items-center justify-evenly lg:w-3/4 rounded-md">
      <div className="join-item">
        <InfoPanel 
          rarity={rarity} 
          count={items.length} 
        />
      </div>
      <div className={`divider divider-horizontal ${dividerColor}`}></div>

      <div className="join-item">
        <ImageCarousel skins={skins} />
      </div>
      <div className="divider divider-horizontal divider-info"></div>

      <div className="flex items-start">
        <div className="join-item">
          <DetailsPanel  total={totalPrice} />
        </div>
        <div className="join-item">
          <PlayersPanel players={players} />
        </div>
      </div>
      <div className="divider divider-horizontal divider-primary"></div>

      <div className="join-item">
        <ButtonPanel tradeupId={id} />
      </div>
    </div>
  )
}

function InfoPanel({ rarity, count }: { rarity: string, count: number }) {
  const textColor: string = ""

  return (
    <div className="card card-sm w-36">
      <div className="card-body justify-center ml-4">
        <div className="flex flex-col items-center">
          <div className={`card-title font-bold m-auto ${textColor} text-xl`}>
            {rarity}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="card-title font-bold text-warning text-xl">
            {count}
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailsPanel({ total }: { total: number }) {
  return (
    <div className="card card-sm">
      <div className="card-body justify-center">
        <div className="flex flex-col items-center gap-1.5">
          <div className="card-title">
            Pool Value
          </div>
          <div className="card-title">
            ${total}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayersPanel({ players }: { players: any[] }) {
  return (
    <div className="card card-sm">
      <div className="card-body justify-center">
        <div className="flex flex-col gap-1.5 items-center">
          <div className="card-title">
            Players
          </div>
          {/*
          <div className="card-title">
            {players.length !== 0 ? (
              <AvatarGroup
                players={players}
              />
            ) : (
              <div>None</div>
            )}
          </div>
          */}
        </div>
      </div>
    </div>
  )
}

function ButtonPanel({ tradeupId }: { tradeupId: string }) {
  const navigate = useNavigate()

  const onJoin = () => {
    const url = `/tradeups/${tradeupId}`
    navigate(url)
  }

  return (
    <button className="btn btn-soft rounded-md btn-success w-30 mr-2" onClick={onJoin}>
      Join
    </button>
  )
}
