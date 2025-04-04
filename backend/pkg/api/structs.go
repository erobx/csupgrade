package api

import "time"

type NewUserRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Email 	 string `json:"email"`
}

type User struct {
	Id 		 string 	`json:"userId"`
	Username string 	`json:"username"`
	Email 	 string 	`json:"email"`
	Hash 	 string 	`json:"hash"`
	Data 	 UserData 	`json:"userData"`
}

type UserData struct {
	Balance 			float64 	`json:"balance"`
	AvatarSrc 			string 		`json:"avatarSrc"`
	RefreshTokenVersion int 		`json:"refreshTokenVersion"`
	CreatedAt 			time.Time 	`json:"createdAt"`
}

type Inventory struct {
    UserId  string  `json:"userId"`
    Items   []Item  `json:"items"`
}

type Item struct {
    InvId   int     `json:"invId"`
    Data    any     `json:"data"`
    Visible bool    `json:"visible"`
}

type Tradeup struct {
    Id      int     `json:"id"`
    Rarity  string  `json:"rarity"`
    Items   []Item  `json:"items"`
    Locked  bool    `json:"locked"`
    Status  string  `json:"status"`
}

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

type Event struct {
	
}
