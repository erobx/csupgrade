package structs

type Inventory struct {
    UserId  string      `json:"userId"`
    Items   []SkinItem  `json:"items"`
}
