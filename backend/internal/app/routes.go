package app

import (
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

func (s *Server) Routes() {
	s.app.Get("/", func(c *fiber.Ctx) error {
        return c.SendString("Hello, world!")
    })

    s.app.Get("/ws", websocket.New(s.handleWebSocket))

	auth := s.app.Group("auth")
	auth.Post("/register", s.register())
	auth.Post("/login", s.login())
	
    v1 := s.app.Group("v1")
    v1.Get("/inventory", s.getInventory())
}

func (s *Server) ProtectedRoutes() {
    v1 := s.app.Group("v1")
	users := v1.Group("users")
	users.Get("/", s.getUser())
}
