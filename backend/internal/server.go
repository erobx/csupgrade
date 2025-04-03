package internal

import (
	"encoding/json"
	"log"
	"sync"
	"time"

	"github.com/erobx/tradeups-backend/structs"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

var (
    s1 = structs.Skin{
        Id: 1,
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

    s2 = structs.Skin{
        Id: 2,
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
    clients     map[string]*Client
    tradeups    map[string]*structs.Tradeup // REPLACE WITH DB
}

func NewServer(addr string) *Server {
    s := &Server{
        addr: addr,
        app: fiber.New(),
        clients: make(map[string]*Client),
        tradeups: map[string]*structs.Tradeup{},
    }

    t1 := &structs.Tradeup{
        Id: 1,
        Rarity: "Consumer",
        Items: make([]structs.Item, 0),
        Locked: false,
        Status: "Active",
    }
    
    t2 := &structs.Tradeup{
        Id: 2,
        Rarity: "Consumer",
        Items: make([]structs.Item, 0),
        Locked: false,
        Status: "Active",
    }

    item1 := structs.Item{
        InvId: 1,
        Data: s1,
        Visible: true,
    }

    item2 := structs.Item{
        InvId: 5,
        Data: s2,
        Visible: true,
    }

    t1.Items = append(t1.Items, item1)
    t1.Items = append(t1.Items, item2)
    t2.Items = append(t2.Items, item2)

    s.tradeups["1"] = t1
    s.tradeups["2"] = t2

    s.useMiddleware()
    s.mapHandlers()

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

func (s *Server) useMiddleware() {
    s.app.Use(cors.New(cors.Config{
        AllowOrigins: "*",
        AllowCredentials: false,
        AllowHeaders: "Origin, Content-Type, Accept",
        AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
    }))

    s.app.Use("/ws", func(c *fiber.Ctx) error {
        if websocket.IsWebSocketUpgrade(c) {
            c.Locals("allowed", true)
           // Your authentication process goes here. Get the Token from header and validate it
           // Extract the claims from the token and set them to the Locals
           // This is because you cannot access headers in the websocket.Conn object below
           //c.Locals("GROUP", string(c.Request().Header.Peek("GROUP")))
           //c.Locals("USER", string(c.Request().Header.Peek("USER")))
           return c.Next()
          }
      return fiber.ErrUpgradeRequired
    })
}

func (s *Server) mapHandlers() {
    s.app.Get("/", func(c *fiber.Ctx) error {
        return c.SendString("Hello, world!")
    })

    v1 := s.app.Group("v1")
    v1.Get("/inventory", s.getInventory())

    s.app.Get("/ws", websocket.New(s.handleWebSocket))
}

func (s *Server) getInventory() fiber.Handler {
    return func(c *fiber.Ctx) error {
        userId := c.Query("userId")
        log.Printf("Requesting inventory for %s\n", userId)

        

        items := []structs.Item{
            {
                InvId: 1,
                Data: s1,
                Visible: true,
            },{
                InvId: 2,
                Data: s2,
                Visible: true,
            },
        }

        inventory := structs.Inventory{
            UserId: userId,
            Items: items,
        }

        return c.JSON(inventory)
    }
}

func (s *Server) handleWebSocket(c *websocket.Conn) {
    log.Printf("New connection\n")
    userId := c.Query("userId")

    sessionId := ""
    if userId == "" {
        sessionId = "test"
        userId = sessionId
    }

    client := &Client{
        Conn: c,
        UserId: userId,
        SessionId: sessionId,
        SubscribedAll: false,
        SubscribedId: "",
    }

    s.Lock()
    s.clients[userId] = client
    s.Unlock()

    defer func() {
        s.Lock()
        delete(s.clients, userId)
        s.Unlock()
        c.Close()
    }()

    for {
        _, msg, err := c.ReadMessage()
        if err != nil {
            log.Println("WebSocket closed for", userId, ":", err)
            break
        }

        s.handleSubscription(userId, msg)
    }
}

func (s *Server) handleSubscription(userId string, msg []byte) {
    log.Println(string(msg))
    var payload struct {
        Event       string `json:"event"`
        UserId      string `json:"userId,omitempty"`
        TradeupId   string `json:"tradeupId,omitempty"`
    }

    if err := json.Unmarshal(msg, &payload); err != nil {
        log.Println("Invalid JSON:", err)
        return
    }

    s.Lock()
    defer s.Unlock()
    
    client, exists := s.clients[userId]
    if !exists {
        return
    }

    switch payload.Event {
    case "subscribe_all":
        client.SubscribedAll = true
        client.SubscribedId = ""
        temp := []structs.Tradeup{}
        for _, t := range s.tradeups {
            temp = append(temp, *t)
        }
        log.Println("Sending tradeups:", temp)
        client.Conn.WriteJSON(fiber.Map{"event": "sync_state", "tradeups": temp})
    case "subscribe_one":
        client.SubscribedAll = false
        client.SubscribedId = payload.TradeupId
        t, exists := s.tradeups[payload.TradeupId]
        if exists {
            client.Conn.WriteJSON(fiber.Map{"event": "sync_tradeup", "tradeup": t})
        }
    case "unsubscribe":
        client.SubscribedAll = false
        client.SubscribedId = ""
        client.Conn.WriteJSON(fiber.Map{"event": "unsync"})
    }
}

//func (s *Server) addSkin(userId, tradeupId, skinId string) {
//    s.Lock()
//
//    log.Println("Adding skin...")
//    t, exists := s.tradeups[tradeupId]
//    if !exists {
//        t = &structs.Tradeup{Id: tradeupId, Skins: make(map[string]string)}
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
        } else if client.SubscribedId != "" {
            if t, exists := s.tradeups[client.SubscribedId]; exists {
                client.Conn.WriteJSON(fiber.Map{"event": "sync_tradeup", "tradeup": t})
            }
        }
    }
}
