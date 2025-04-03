export interface Skin {
  id: string;
  name: string;
  rarity: string;
}

export interface Tradeup {
  id: string;
  rarity: string;
  locked: boolean;
  skins: Record<string, Skin>; // skinId => skin
}
