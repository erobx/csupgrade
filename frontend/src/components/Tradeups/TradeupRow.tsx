import { useNavigate } from "react-router";
import { InventoryItem } from "../../types/inventory"
import { Skin } from "../../types/skin";
import ImageCarousel from "../ImageCarousel";
import AvatarGroup from "../AvatarGroup";
import { dividerMap } from "../../constants/constants";
import { User } from "../../types/user";

interface TradeupRowProps {
  id: string;
  players: User[];
  rarity: string;
  items: InventoryItem[];
  mode: string;
}

export default function TradeupRow({ id, players, rarity, items, mode }: TradeupRowProps) {
  const dividerColor: string = dividerMap[rarity]

  let skins: Skin[] = []
  if (items.length > 0) {
    skins = items.filter(item =>
      item.data && typeof item.data === 'object' && 'id' in item.data &&
      'name' in item.data && 'rarity' in item.data).map(item => item.data as Skin)
  }

  const totalPrice: number = skins.reduce((acc, curr) => acc + curr.price, 0)

  return (
    <div className="join bg-base-300 border-6 border-base-200 items-center w-full lg:w-3/4 rounded-md">
      <div className="join-item">
        <InfoPanel 
          rarity={rarity} 
          count={items.length} 
        />
      </div>
      <div className={`divider divider-horizontal ${dividerColor}`}></div>

      <div className="join-item w-5/8">
        <ImageCarousel skins={skins} />
      </div>
      <div className="divider divider-horizontal divider-info"></div>

      <div className="join-item w-1/6">
        <DetailsPanel 
          total={totalPrice}
          players={players}
        />
      </div>
      <div className="divider divider-horizontal divider-primary"></div>

      <div className="join-item">
        <ButtonPanel tradeupId={id} mode={mode} />
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
          <div className="card-title font-bold text-primary text-xl">
            {count}
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailsPanel({ total, players }: { total: number, players: User[] }) {
  return (
    <div className="flex justify-evenly">
      <div className="flex flex-col items-center gap-1.5">
        <h1 className="font-bold">Pool Value</h1>
        <h2 className="font-bold">${total.toFixed(2)}</h2>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <h1 className="font-bold">Players</h1>
        <div className="font-bold">
          {players && players.length !== 0 ? (
            <AvatarGroup
              players={players}
            />
          ) : (
            <h1 className="font-bold">None</h1>
          )}
        </div>
      </div>
    </div>
  )
}

function ButtonPanel({ tradeupId, mode }: { tradeupId: string, mode: string }) {
  const navigate = useNavigate()

  const onJoin = () => {
    const url = `/tradeups/${tradeupId}`
    navigate(url)
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <h1 className="font-bold mr-3">{mode}</h1>
      <button className="btn btn-soft rounded-md btn-success w-30 mr-2" onClick={onJoin}>
        Join
      </button>
    </div>
  )
}
