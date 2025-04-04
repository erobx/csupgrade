package app

import (
	"time"

	"github.com/erobx/tradeups-backend/pkg/api"
	"github.com/gofiber/contrib/websocket"
)

const (
    // Time allowed to write a message to the peer.
    writeWait = 10 * time.Second
    // Time allowed to read the next pong message from the peer.
    pongWait = 60 * time.Second
    // Send pings to peer with this period. Must be less than pongWait.
    pingPeriod = (pongWait * 9) / 10
    
    maxMessageSize = 512
)

var (
    newline = []byte{'\n'}
    space   = []byte{' '}
)

type Client struct {
    Conn    *websocket.Conn
    UserID  string // Empty if anon
    SessionID string // Unique id for anon users
    SubscribedAll bool
    SubscribedID string
    Inventory api.Inventory
}
