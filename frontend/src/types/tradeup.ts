import { InventoryItem } from "./inventory";

export type Tradeup = {
  id: string;
  rarity: string;
  locked: boolean;
  items: InventoryItem[];
  status: string;
}
