import { InventoryItem } from "./inventory";
import { User } from "./user";

export type Tradeup = {
  id: string;
  rarity: string;
  locked: boolean;
  items: InventoryItem[];
  status: string;
  stopTime: Date;
  players: User[];
}
