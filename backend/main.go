package main

import (
	"github.com/erobx/tradeups-backend/internal"
)

func main() {
	server := internal.NewServer("8080")
	server.Run()
}
