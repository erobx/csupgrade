package app

import (
	"log"

	"github.com/erobx/tradeups-backend/structs"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

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
