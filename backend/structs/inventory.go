package structs

type Inventory struct {
    UserId  string  `json:"userId"`
    Items   []Item  `json:"items"`
}

type Item struct {
    InvId   int     `json:"invId"`
    Data    any     `json:"data"`
    Visible bool    `json:"visible"`
}
