import { Skin } from "./skin";

export type InventoryItem = {
  invId: string; // invId => 1661
  data?: any | Skin; // could be a skin
  visible: boolean;
}

export type Inventory = {
  userId: string;
  items: InventoryItem[];
}
