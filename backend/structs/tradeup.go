package structs

type Tradeup struct {
    Id      string          `json:"id"`
    Rarity  string          `json:"rarity"`
    Skins   map[string]string `json:"skins"`
    Locked  bool            `json:"locked"`
}
