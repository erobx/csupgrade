package app

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/contrib/websocket"
)

func (s *Server) Routes() {
	s.app.Get("/", func(c *fiber.Ctx) error {
        return c.SendString("Hello, world!")
    })

    v1 := s.app.Group("v1")
    v1.Get("/inventory", s.getInventory())

    s.app.Get("/ws", websocket.New(s.handleWebSocket))
}
