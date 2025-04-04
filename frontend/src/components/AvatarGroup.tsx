import { Player } from "../types/tradeup"

export default function AvatarGroup({ players }: { players: Player[] }) {
  return (
    <div className="avatar-group gap-1">
      {players.map((p) => (
        <div className="avatar avatar-placeholder">
          <div className="bg-neutral text-neutral-content w-8 rounded-full">
            <span>{p.username[0].toUpperCase()}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
