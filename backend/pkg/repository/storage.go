package repository

import (
	"context"

	"github.com/erobx/tradeups-backend/pkg/api"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

// Contains methods for interacting with the DB
type Storage interface {
	CreateUser(request *api.NewUserRequest) (string, error)
	GetUserByID(userID string) (api.User, error)
	GetUserAndHashByEmail(email string) (api.User, string, error)
}

type storage struct {
	db *pgxpool.Pool
}

func NewStorage(db *pgxpool.Pool) Storage {
	return &storage{db: db}
}

func (s *storage) CreateUser(request *api.NewUserRequest) (string, error) {
	id := uuid.New().String()

	hashed, err := bcrypt.GenerateFromPassword([]byte(request.Password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	q := "insert into users(id,username,email,hash,avatar_key,created_at) values($1,$2,$3,$4,$5,now())"
	_, err = s.db.Exec(context.Background(), q, id, request.Username, request.Email, string(hashed), "none")

	return id, err
}

func (s *storage) GetUserByID(userID string) (api.User, error) {
	var user api.User
	var avatarKey string

	q := "select id,username,email,balance,refresh_token_version,avatar_key,created_at from users where id=$1"
	row := s.db.QueryRow(context.Background(), q, userID)
	err := row.Scan(&user.ID, &user.Username, &user.Email, &user.Balance,
			&user.RefreshTokenVersion, &avatarKey, &user.CreatedAt)

	// TODO: generate url for avatarKey, then assign to user.AvatarSrc

	return user, err
}

func (s *storage) GetUserAndHashByEmail(email string) (api.User, string, error) {
	var user api.User
	var hash string
	var avatarKey string

	q := "select * from users where email=$1"
	row := s.db.QueryRow(context.Background(), q, email)
	err := row.Scan(&user.ID, &user.Username, &user.Email, &hash, &user.Balance,
			&user.RefreshTokenVersion, &avatarKey, &user.CreatedAt)

	// TODO: generate url for avatarKey, then assign to user.AvatarSrc

	return user, hash, err
}
