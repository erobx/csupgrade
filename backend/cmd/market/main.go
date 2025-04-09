package main

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"os"

	"github.com/erobx/tradeups-backend/pkg/db"
	"github.com/joho/godotenv"
)

type Item struct {
    MarketHashName string  `json:"market_hash_name"`
    Currency       string  `json:"currency"`
    SuggestedPrice float64 `json:"suggested_price"`
    ItemPage       string  `json:"item_page"`
    MarketPage     string  `json:"market_page"`
    MinPrice       float64 `json:"min_price"`
    MaxPrice       float64 `json:"max_price"`
    MeanPrice      float64 `json:"mean_price"`
    MedianPrice    float64 `json:"median_price"`
    Quantity       int     `json:"quantity"`
    CreatedAt      int64   `json:"created_at"`
    UpdatedAt      int64   `json:"updated_at"`
}

type Details struct {
	Name string `json:"name"`
	Wear string `json:"wear"`
	Price float64 `json:"price"`
}

// s.name, i.wear_str => concat => check market_hash_name => get suggested_price

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalln(err)
	}

	db, err := db.CreateConnection()
	if err != nil {
		log.Fatalln(err)
	}
	defer db.Close()

	items := make([]Item, 0)
	file, err := os.Open("data.json")
	if err != nil {
		log.Fatalln(err)
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		log.Fatalln(err)
	}

	err = json.Unmarshal(data, &items)
	if err != nil {
		log.Fatalln(err)
	}

	itemData := make(map[string]Item)
	for _, item := range items {
		if _, ok := itemData[item.MarketHashName]; !ok {
			itemData[item.MarketHashName] = item
		}
	}

	q := `
	select s.name,i.wear_str,i.id from inventory i
	join skins s on s.id = i.skin_id
	`
	rows, err := db.Query(context.Background(), q)
	if err != nil {
		log.Fatalln(err)
	}
	defer rows.Close()

	skinData := make(map[string]Details)

	for rows.Next() {
		var name, wear string
		var id int
		err := rows.Scan(&name, &wear, &id)
		if err != nil {
			log.Fatalln(err)
		}

		hashname := name + " (" + wear + ")"
		if _, ok := skinData[hashname]; !ok {
			p := itemData[hashname].SuggestedPrice
			d := Details{Name: name, Wear: wear, Price: p}
			skinData[hashname] = d
		}
	}

	for _, v := range skinData {
		q := `
		update inventory 
		set price=$1
		from skins
		where skins.id = inventory.skin_id
		and skins.name = $2
		and inventory.wear_str = $3
		`
		_, err := db.Exec(context.Background(), q, v.Price, v.Name, v.Wear)
		if err != nil {
			log.Fatalln(err)
		}
	}
}
