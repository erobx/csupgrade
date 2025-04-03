package structs

import "time"

type SkinItem struct {
    InvId   int     `json:"invId"`
    Skin    Skin    `json:"skin"`
    Visible bool    `json:"visible"`
}

type Skin struct {
    Id          int         `json:"id"`
    Name        string      `json:"name"` // AWP | Dragon Lore
    Rarity      string      `json:"rarity"` // Covert
    Collection  string      `json:"collection"`// The ... Collection
    WearName    string      `json:"wearName"`// Factory New
    WearNum     float64     `json:"wearNum"` // 0.05231
    Price       float64     `json:"price"`// $100.34
    IsStatTrak  bool        `json:"isStatTrak"`
    WasWon      bool        `json:"wasWon"`
    ImgSrc      string      `json:"imgSrc"`
    CreatedAt   time.Time   `json:"createdAt"`
}
