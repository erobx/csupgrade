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

type Server struct {
    sync.Mutex

    addr        	string
	privateKey 		*rsa.PrivateKey
    app         	*fiber.App
	validator 		Validator

	userService 	api.UserService
	storeService 	api.StoreService
	tradeupService 	api.TradeupService

    clients     	map[string]*Client
}

func NewServer(addr string, privKey *rsa.PrivateKey, us api.UserService, ss api.StoreService, ts api.TradeupService) *Server {
    s := &Server{
        addr: addr,
        app: fiber.New(),
		validator: NewValidator(),
		privateKey: privKey,
		userService: us,
		storeService: ss,
		tradeupService: ts,
        clients: make(map[string]*Client),
    }

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
		tradeups, err := s.tradeupService.GetAllTradeups()
		if err != nil {
			log.Printf("Error getting tradeups - %v\n", err)
			return
		}
        client.Conn.WriteJSON(fiber.Map{"event": "sync_state", "tradeups": tradeups})
    case "subscribe_one":
        client.SubscribedAll = false
        client.SubscribedID = payload.TradeupID
		t, err := s.tradeupService.GetTradeupByID(payload.TradeupID)
		if err != nil {
			log.Printf("Error getting tradeup %s - %v\n", payload.TradeupID, err)
			return
		}
		client.Conn.WriteJSON(fiber.Map{"event": "sync_tradeup", "tradeup": t})
    case "unsubscribe":
        client.SubscribedAll = false
        client.SubscribedID = ""
        client.Conn.WriteJSON(fiber.Map{"event": "unsync"})
    }
}

func (s *Server) broadcastState() {
    s.Lock()
    defer s.Unlock()

    for _, client := range s.clients {
        if client.SubscribedAll {
			tradeups, err := s.tradeupService.GetAllTradeups()
			if err != nil {
				log.Println(err)
				return
			}
            client.Conn.WriteJSON(fiber.Map{"event": "sync_state", "tradeups": tradeups})
        } else if client.SubscribedID != "" {
			t, err := s.tradeupService.GetTradeupByID(client.SubscribedID)
			if err != nil {
				log.Println(err)
				return 
			}
			client.Conn.WriteJSON(fiber.Map{"event": "sync_tradeup", "tradeup": t})
        }
    }
}

func (s *Server) maintainTradeupCount() {
}
