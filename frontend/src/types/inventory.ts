import { Skin } from "./skin";

export type InventoryItem = {
  invId: string; // invId => 1661
  data: Skin | any; // could be a skin or other item tbd
  visible: boolean;
}

export type Inventory = {
  userId: string;
  items: InventoryItem[];
}
