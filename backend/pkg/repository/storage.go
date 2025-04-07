package repository

import (
	"context"
	"database/sql"
	"errors"
	"log"
	"math/rand/v2"
	"strings"

	"github.com/erobx/tradeups-backend/pkg/api"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
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
	GetRecentTradeups(userID string) ([]api.Tradeup, error)

	// Store
	BuyCrate(crateID, userID string, amount int) (float64, []api.Item, error)
	
	// Tradeups
	GetAllTradeups() ([]api.Tradeup, error)
	GetTradeupByID(tradeupID string) (api.Tradeup, error)
	CheckSkinOwnership(invID, userID string) (bool, error)
	IsTradeupFull(tradeupID string) (bool, error)
	AddSkinToTradeup(tradeupID, invID string) error
	StartTimer(tradeupID string) error
}

type storage struct {
	db *pgxpool.Pool
	cdnUrl string
}

func NewStorage(db *pgxpool.Pool, url string) Storage {
	return &storage{db: db, cdnUrl: url}
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

		skin.ImgSrc = s.createImgSrc(imageKey)
		item.Data = skin
		inventory.Items = append(inventory.Items, item)
	}

	return inventory, nil
}

func (s *storage) GetRecentTradeups(userID string) ([]api.Tradeup, error) {
	var recentTradeups []api.Tradeup

	return recentTradeups, nil
}

/*
Functions relating to the store service
*/

func (s *storage) BuyCrate(crateID, userID string, amount int) (float64, []api.Item, error) {
	var updatedBalance float64
	var addedItems []api.Item

	tx, err := s.db.BeginTx(context.Background(), pgx.TxOptions{})
	if err != nil {
		return updatedBalance, addedItems, err
	}
	defer func() {
		tx.Commit(context.Background())
	}()
	
	q := `
	with updated as (
		update users
		set balance = balance - ((select cost from crates where id=$1) * $2)
		where id = (select id from users where id=$3)
		and balance >= ((select cost from crates where id=$1) * $2)
		returning balance
	) select * from updated
	`
	err = tx.QueryRow(context.Background(), q, crateID, amount, userID).Scan(&updatedBalance)
	if err != nil {
		tx.Rollback(context.Background())
		return updatedBalance, addedItems, errors.New("insufficent funds")
	}

	q = `select skin_id from crate_skins where crate_id=$1 order by random() limit $2`
	rows, err := tx.Query(context.Background(), q, crateID, amount)
	if err != nil {
		tx.Rollback(context.Background())
		return updatedBalance, addedItems, err
	}
	defer rows.Close()

	var skinIDs []int
	for rows.Next() {
		var skinID int
		err := rows.Scan(&skinID)
		if err != nil {
			log.Println("Failed scanning skin id")
			tx.Rollback(context.Background())
			return updatedBalance, addedItems, err
		}

		skinIDs = append(skinIDs, skinID)
	}

	for _, skinID := range skinIDs {
		var canBeStatTrak, isStatTrak bool
		q = "select can_be_stattrak from skins where id=$1"
		err = tx.QueryRow(context.Background(), q, skinID).Scan(&canBeStatTrak)

		if err != nil {
			log.Println("Failed scanning StatTrak")
			tx.Rollback(context.Background())
			return updatedBalance, addedItems, err
		}

		if canBeStatTrak {
			isStatTrak = api.IsStatTrak()
		}

		// generate float value and corresponding wear name
		floatValue := rand.Float64()
		wear := api.GetWearFromFloatValue(floatValue)

		var skin api.Skin
		var item api.Item
		var imageKey string

		// add skins for each randomly selected id
		q = `
		with item as (
			insert into inventory(user_id,skin_id,wear_str,wear_num,price,is_stattrak,created_at) 
			values($1,$2,$3,$4,12.34,$5,now())
			returning *
		) select item.id, item.skin_id, item.wear_str, item.wear_num, item.price, 
			item.is_stattrak, item.was_won, item.created_at, item.visible, s.name, 
			s.rarity, s.collection, s.image_key
		from item
		join skins s on s.id = item.skin_id
		`
		row := tx.QueryRow(context.Background(), q, userID, skinID, wear, floatValue, isStatTrak)
		err = row.Scan(&item.InvID, &skin.ID, &skin.Wear, &skin.Float, &skin.Price, 
					&skin.IsStatTrak, &skin.WasWon, &skin.CreatedAt, &item.Visible, &skin.Name, 
					&skin.Rarity, &skin.Collection, &imageKey)

		if err != nil {
			log.Println("Failed scanning item")
			tx.Rollback(context.Background())
			return updatedBalance, addedItems, err
		}

		skin.ImgSrc = s.createImgSrc(imageKey)
		item.Data = skin
		addedItems = append(addedItems, item)
	}

	return updatedBalance, addedItems, nil
}

/*
Functions for TradeupService
*/

func (s *storage) GetAllTradeups() ([]api.Tradeup, error) {
	var tradeups []api.Tradeup
	var ids []string

	q := `select id from tradeups where current_status = 'Active'`
	rows, err := s.db.Query(context.Background(), q)
	if err != nil {
		return tradeups, nil
	}
	defer rows.Close()

	for rows.Next() {
		var id string
		err := rows.Scan(&id)
		if err != nil {
			return tradeups, err
		}
		
		ids = append(ids, id)
	}

	for _, id := range ids {
		t, err := s.GetTradeupByID(id)
		if err != nil {
			return tradeups, err
		}

		tradeups = append(tradeups, t)
	}

	return tradeups, nil
}

func (s *storage) GetTradeupByID(tradeupID string) (api.Tradeup, error) {
	var tradeup api.Tradeup

	tx, err := s.db.BeginTx(context.Background(), pgx.TxOptions{})
	if err != nil {
		return tradeup, err
	}
	defer func() {
		tx.Commit(context.Background())
	}()

	var winner sql.NullString

	q := `
	select * from tradeups where id=$1
	`
	err = s.db.QueryRow(context.Background(), q, tradeupID).Scan(&tradeup.ID,
		&tradeup.Rarity, &tradeup.Status, &winner, &tradeup.StopTime)
	if err != nil {
		tx.Rollback(context.Background())
		return tradeup, err
	}

	if winner.Valid {
		tradeup.Winner = winner.String
	} else {
		tradeup.Winner = ""
	}

	items := make([]api.Item, 0)
	q = `
	select i.id, i.skin_id, i.wear_str, i.wear_num, i.price, i.is_stattrak, 
		i.created_at, s.name, s.rarity, s.collection, s.image_key
	from tradeups t
	join tradeups_skins ts on ts.tradeup_id = t.id
	join inventory i on i.id = ts.inv_id
	join skins s on s.id = i.skin_id
	where t.id=$1
	`
	rows, err := s.db.Query(context.Background(), q, tradeupID)
	if err != nil {
		tx.Rollback(context.Background())
		return tradeup, err
	}
	defer rows.Close()

	for rows.Next() {
		var item api.Item
		var skin api.Skin
		var imageKey string

		err := rows.Scan(&item.InvID, &skin.ID, &skin.Wear, &skin.Float, &skin.Price,
						&skin.IsStatTrak, &skin.CreatedAt, &skin.Name, &skin.Rarity,
						&skin.Collection, &imageKey)
		if err != nil {
			tx.Rollback(context.Background())
			return tradeup, err
		}

		skin.ImgSrc = s.createImgSrc(imageKey)
		item.Data = skin
		items = append(items, item)
	}

	tradeup.Items = items
	return tradeup, nil
}

func (s *storage) CheckSkinOwnership(invID, userID string) (bool, error) {
	isOwned := false

	q := "select exists(select 1 from inventory where id=$1 and user_id=$2)"
	err := s.db.QueryRow(context.Background(), q, invID, userID).Scan(&isOwned)

	return isOwned, err
}

func (s *storage) IsTradeupFull(tradeupID string) (bool, error) {
	var count int
	q := "select count(*) from tradeups_skins where tradeup_id=$1"
	err := s.db.QueryRow(context.Background(), q, tradeupID).Scan(&count)
	if err != nil {
		return false, err
	}

	if count == 10 {
		return true, nil
	}

	return false, nil
}

func (s *storage) AddSkinToTradeup(tradeupID, invID string) error {
	tx, err := s.db.BeginTx(context.Background(), pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer func() {
		tx.Commit(context.Background())
	}()

	q := "insert into tradeups_skins values($1,$2)"
	_, err = tx.Exec(context.Background(), q, tradeupID, invID)
	if err != nil {
		tx.Rollback(context.Background())
		return err
	}

	q = "update inventory set visible=false where id=$1"
	_, err = tx.Exec(context.Background(), q, invID)
	if err != nil {
		tx.Rollback(context.Background())
		return err
	}

	return nil
}

func (s *storage) StartTimer(tradeupID string) error {
	q := "update tradeups set stop_time = now() + interval '5 min' where id=$1"
	_, err := s.db.Exec(context.Background(), q, tradeupID)
	if err != nil {
		return err
	}

	return nil
}

// url + guns/ak/imageKey
func (s *storage) createImgSrc(imageKey string) string {
	prefix := imageKey[:strings.Index(imageKey, "-")]
	url := s.cdnUrl + "guns/" + prefix + "/" + imageKey
	return url
}
