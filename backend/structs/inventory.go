package structs

type Inventory struct {
    UserId  string  `json:"userId"`
    Items   []Item  `json:"items"`
}
