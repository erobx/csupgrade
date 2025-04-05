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
	// User updates
	CreateUser(request *api.NewUserRequest) (string, error)
	GetUserByID(userID string) (api.User, error)
	GetUserAndHashByEmail(email string) (api.User, string, error)
	GetInventory(userID string) (api.Inventory, error)

	// Store
	UpdateBalance(crateID, userID string) error
	AddSkinsToInventory(userID string) error
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

func (s *storage) GetInventory(userID string) (api.Inventory, error) {
	inventory := api.Inventory{
		UserID: userID,
		Items: make([]api.Item, 0),
	}

	q := `
	select i.id, i.skin_id, i.wear_str, i.wear_num, i.price, i.is_stattrak,
		i.was_won, i.created_at, i.visible, s.name, s.rarity, s.collection, s.image_key
	from inventory i
	join skins s on s.id = i.skin_id
		where i.user_id = $1
	`
	rows, err := s.db.Query(context.Background(), q, userID)
	if err != nil {
		return inventory, err
	}
	defer rows.Close()

	for rows.Next() {
		var item api.Item
		var skin api.Skin
		var imageKey string

		err := rows.Scan(&item.InvID, &skin.ID, &skin.Wear, &skin.Float, &skin.Price,
						&skin.IsStatTrak, &skin.WasWon, &skin.CreatedAt, &item.Visible,
						&skin.Name, &skin.Rarity, &skin.Collection, &imageKey)
		if err != nil {
			return inventory, err
		}

		item.Data = skin
		inventory.Items = append(inventory.Items, item)
	}

	return inventory, nil
}

func (s *storage) UpdateBalance(crateID, userID string) error {

	q := `select cost from crates where id=$1`

	return nil
}

func (s *storage) AddSkinsToInventory(userID string) error {
	return nil
}
