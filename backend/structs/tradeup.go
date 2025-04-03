package structs

type Tradeup struct {
    Id      int     `json:"id"`
    Rarity  string  `json:"rarity"`
    Items   []Item  `json:"items"`
    Locked  bool    `json:"locked"`
    Status  string  `json:"status"`
}
