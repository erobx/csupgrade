import { badgeMap } from "../constants/constants"

export default function RarityBadge({ rarity }: { rarity: string }) {
 const badgeColor = badgeMap[rarity]

  return (
    <span className={`badge ${badgeColor}`}>{rarity}</span>
  )
}
