package repository

import "github.com/erobx/tradeups-backend/pkg/api"

type Storage interface {
	CreateUser(request api.NewUserRequest) error
	GetUser(userId string) error
}
