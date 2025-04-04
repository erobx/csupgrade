package app

import (
	"crypto/rsa"
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/erobx/tradeups-backend/pkg/api"
	"github.com/gofiber/fiber/v2"
)

var (
    s1 = api.Skin{
        ID: 1,
        Name: "AWP | Dragon Lore",
        Rarity: "Covert",
        Collection: "The Anal Collection",
        Wear: "Factory New",
        Float: 0.0521,
        Price: 1321.42,
        IsStatTrak: true,
        WasWon: false,
        ImgSrc: "",
        CreatedAt: time.Now(),
    }

    s2 = api.Skin{
        ID: 2,
        Name: "AUG | Wings",
        Rarity: "Industrial",
        Collection: "The Booty Collection",
        Wear: "Battle-Scarred",
        Float: 0.9213,
        Price: 0.10,
        IsStatTrak: false,
        WasWon: false,
        ImgSrc: "",
        CreatedAt: time.Now(),
    }
)

type Server struct {
    sync.Mutex
    addr        string
    app         *fiber.App
	privateKey *rsa.PrivateKey
	userService api.UserService
    clients     map[string]*Client
    tradeups    map[string]*api.Tradeup // REPLACE WITH DB
}

func NewServer(addr string, privKey *rsa.PrivateKey, us api.UserService) *Server {
    s := &Server{
        addr: addr,
        app: fiber.New(),
		privateKey: privKey,
		userService: us,
        clients: make(map[string]*Client),
        tradeups: map[string]*api.Tradeup{},
    }

    t1 := &api.Tradeup{
        ID: 1,
        Rarity: "Consumer",
        Items: make([]api.Item, 0),
        Locked: false,
        Status: "Active",
    }
    
    t2 := &api.Tradeup{
        ID: 2,
        Rarity: "Consumer",
        Items: make([]api.Item, 0),
        Locked: false,
        Status: "Active",
    }

    item1 := api.Item{
        InvID: 1,
        Data: s1,
        Visible: true,
    }

    item2 := api.Item{
        InvID: 5,
        Data: s2,
        Visible: true,
    }

    t1.Items = append(t1.Items, item1)
    t1.Items = append(t1.Items, item2)
    t2.Items = append(t2.Items, item2)

    s.tradeups["1"] = t1
    s.tradeups["2"] = t2

    s.UseMiddleware()
    s.Routes()

	s.Protect()
	s.ProtectedRoutes()

    return s
}

func (s *Server) Run() {
    ticker := time.NewTicker(time.Second)
    go func() {
        for range ticker.C {
            s.broadcastState()
        }
    }()

    log.Fatal(s.app.Listen(":"+s.addr))
}

func (s *Server) handleSubscription(userID string, msg []byte) {
    log.Println(string(msg))
    var payload struct {
        Event       string `json:"event"`
        UserID      string `json:"userID,omitempty"`
        TradeupID   string `json:"tradeupID,omitempty"`
    }

    if err := json.Unmarshal(msg, &payload); err != nil {
        log.Println("Invalid JSON:", err)
        return
    }

    s.Lock()
    defer s.Unlock()
    
    client, exists := s.clients[userID]
    if !exists {
        return
    }

    switch payload.Event {
    case "subscribe_all":
        client.SubscribedAll = true
        client.SubscribedID = ""
        temp := []api.Tradeup{}
        for _, t := range s.tradeups {
            temp = append(temp, *t)
        }
        log.Println("Sending tradeups:", temp)
        client.Conn.WriteJSON(fiber.Map{"event": "sync_state", "tradeups": temp})
    case "subscribe_one":
        client.SubscribedAll = false
        client.SubscribedID = payload.TradeupID
        t, exists := s.tradeups[payload.TradeupID]
        if exists {
            client.Conn.WriteJSON(fiber.Map{"event": "sync_tradeup", "tradeup": t})
        }
    case "unsubscribe":
        client.SubscribedAll = false
        client.SubscribedID = ""
        client.Conn.WriteJSON(fiber.Map{"event": "unsync"})
    }
}

//func (s *Server) addSkin(userId, tradeupId, skinId string) {
//    s.Lock()
//
//    log.Println("Adding skin...")
//    t, exists := s.tradeups[tradeupId]
//    if !exists {
//        t = &api.Tradeup{Id: tradeupId, Skins: make(map[string]string)}
//        s.tradeups[tradeupId] = t
//    }
//
//    t.Skins[userId] = skinId
//
//    s.Unlock()
//
//    s.broadcastState()
//}

func (s *Server) broadcastState() {
    s.Lock()
    defer s.Unlock()

    for _, client := range s.clients {
        if client.SubscribedAll {
            client.Conn.WriteJSON(fiber.Map{"event": "sync_state", "tradeups": s.tradeups})
        } else if client.SubscribedID != "" {
            if t, exists := s.tradeups[client.SubscribedID]; exists {
                client.Conn.WriteJSON(fiber.Map{"event": "sync_tradeup", "tradeup": t})
            }
        }
    }
}
