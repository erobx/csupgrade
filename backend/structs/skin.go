package structs

import "time"

type Skin struct {
    Id          int         `json:"id"`
    Name        string      `json:"name"` // AWP | Dragon Lore
    Rarity      string      `json:"rarity"` // Covert
    Collection  string      `json:"collection"`// The ... Collection
    Wear        string      `json:"wear"`// Factory New
    Float       float64     `json:"float"` // 0.05231
    Price       float64     `json:"price"`// $100.34
    IsStatTrak  bool        `json:"isStatTrak"`
    WasWon      bool        `json:"wasWon"`
    ImgSrc      string      `json:"imgSrc"`
    CreatedAt   time.Time   `json:"createdAt"`
}
