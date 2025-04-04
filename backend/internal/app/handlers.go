package app

import (
	"encoding/json"
	"log"
	"time"

	"github.com/erobx/tradeups-backend/pkg/api"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func (s *Server) register() fiber.Handler {
	return func(c *fiber.Ctx) error {
		newUserRequest := new(api.NewUserRequest)

		if err := c.BodyParser(newUserRequest); err != nil {
			log.Println(err)
			return c.SendStatus(fiber.StatusBadRequest)
		}

		userID, err := s.userService.New(newUserRequest)
		if err != nil {
			log.Println(err)
			return c.SendStatus(fiber.StatusInternalServerError)
		}
		log.Printf("Created new user %s\n", userID)

		user, err := s.userService.GetUser(userID)
		if err != nil {
			log.Println(err)
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		claims := jwt.MapClaims{
			"id": userID,
			"email": user.Email,
			"refreshTokenVersion": user.RefreshTokenVersion,
			"exp": time.Now().Add(time.Hour * 23).Unix(),
		}

		token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
		t, err := token.SignedString(s.privateKey)
		if err != nil {
			log.Printf("token.SignedString: %v", err)
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.JSON(fiber.Map{
			"user": user,
			"jwt": t,
		})
	}
}

func (s *Server) login() fiber.Handler {
	return func(c *fiber.Ctx) error {
		var newLoginRequest api.NewLoginRequest
		
		err := json.Unmarshal(c.Body(), newLoginRequest)
		if err != nil {
			return err
		}

		user, err := s.userService.Login(newLoginRequest)
		if err != nil {
			log.Println(err)
			return c.SendStatus(fiber.StatusUnauthorized)
		}

		claims := jwt.MapClaims{
			"id": user.ID,
			"email": user.Email,
			"refreshTokenVersion": user.RefreshTokenVersion,
			"exp": time.Now().Add(time.Hour * 23).Unix(),
		}

		token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
		t, err := token.SignedString(s.privateKey)
		if err != nil {
			log.Printf("token.SignedString: %v", err)
		  return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.JSON(fiber.Map{
			"user": user,
			"jwt": t,
		})
	}
}

func (s *Server) getUser() fiber.Handler {
	return func(c *fiber.Ctx) error {
		jwtUser := c.Locals("user").(*jwt.Token)
		claims := jwtUser.Claims.(jwt.MapClaims)
		userID := claims["id"].(string)

		user, err := s.userService.GetUser(userID)
		if err != nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.JSON(fiber.Map{
			"user": user,
		})
	}
}

func (s *Server) getInventory() fiber.Handler {
    return func(c *fiber.Ctx) error {
        userID := c.Query("userID")
        log.Printf("Requesting inventory for %s\n", userID)

        items := []api.Item{
            {
                InvID: 1,
                Data: s1,
                Visible: true,
            },{
                InvID: 2,
                Data: s2,
                Visible: true,
            },
        }

        inventory := api.Inventory{
            UserID: userID,
            Items: items,
        }

        return c.JSON(inventory)
    }
}

func (s *Server) handleWebSocket(c *websocket.Conn) {
    log.Printf("New connection\n")
    userID := c.Query("userID")

    sessionID := ""
    if userID == "" {
        sessionID = "test"
        userID = sessionID
    }

    client := &Client{
        Conn: c,
        UserID: userID,
        SessionID: sessionID,
        SubscribedAll: false,
        SubscribedID: "",
    }

    s.Lock()
    s.clients[userID] = client
    s.Unlock()

    defer func() {
        s.Lock()
        delete(s.clients, userID)
        s.Unlock()
        c.Close()
    }()

    for {
        _, msg, err := c.ReadMessage()
        if err != nil {
            log.Println("WebSocket closed for", userID, ":", err)
            break
        }

        s.handleSubscription(userID, msg)
    }
}
