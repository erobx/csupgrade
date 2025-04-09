import { User } from "../types/user"

export default function AvatarGroup({ players }: { players: User[] }) {
  const sorted = players.sort((a, b) => a.username.localeCompare(b.username))

  return (
    <div className="avatar-group gap-1">
      {sorted.map((p) => (
        <div key={p.id} className="avatar avatar-placeholder">
          <div className="bg-neutral text-neutral-content w-8 rounded-full">
            <span>{p.username[0].toUpperCase()}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
