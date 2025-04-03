import { Skin } from "./skin";

export type Tradeup = {
  id: string;
  rarity: string;
  locked: boolean;
  skins: Map<string, Skin>; // invId => skin
}
