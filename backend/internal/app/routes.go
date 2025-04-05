package app

import (
	"github.com/gofiber/contrib/websocket"
)

func (s *Server) Routes() {
    s.app.Get("/ws", websocket.New(s.handleWebSocket))

	auth := s.app.Group("auth")
	auth.Post("/register", s.register())
	auth.Post("/login", s.login())
}

func (s *Server) ProtectedRoutes() {
    v1 := s.app.Group("v1")

	// v1/users/*
	users := v1.Group("users")
	users.Get("/", s.getUser())
    users.Get("/inventory", s.getInventory())
	users.Get("/:userId/recents", s.getRecentTradeups())
	users.Get("/:userId/stats", s.getUserStats())


}
