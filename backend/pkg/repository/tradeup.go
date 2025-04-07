package repository

import (
	"context"
	"database/sql"

	"github.com/erobx/tradeups-backend/pkg/api"
	"github.com/jackc/pgx/v5"
)

func (s *storage) GetAllTradeups() ([]api.Tradeup, error) {
	var tradeups []api.Tradeup
	var ids []string

	q := `select id from tradeups where current_status = 'Active' or current_status = 'Waiting'`
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
		&tradeup.Rarity, &tradeup.Status, &winner, &tradeup.StopTime, &tradeup.Mode)
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
	players := make(map[string]api.User, 0)
	q = `
	select i.id, i.user_id, i.skin_id, i.wear_str, i.wear_num, i.price, i.is_stattrak, 
		i.created_at, u.username, u.email, u.balance, u.avatar_key, s.name, s.rarity, 
		s.collection, s.image_key
	from tradeups t
	join tradeups_skins ts on ts.tradeup_id = t.id
	join inventory i on i.id = ts.inv_id
	join users u on u.id = i.user_id
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
		var player api.User
		var avatarKey string
		var imageKey string

		err := rows.Scan(&item.InvID, &player.ID, &skin.ID, &skin.Wear, &skin.Float, &skin.Price,
						&skin.IsStatTrak, &skin.CreatedAt, &player.Username, &player.Email, 
						&player.Balance, &avatarKey, &skin.Name, &skin.Rarity, &skin.Collection, &imageKey)
		if err != nil {
			tx.Rollback(context.Background())
			return tradeup, err
		}

		if _, ok := players[player.ID]; !ok {
			player.AvatarSrc = avatarKey
			players[player.ID] = player
		}

		skin.ImgSrc = s.createImgSrc(imageKey)
		item.Data = skin
		items = append(items, item)
	}

	for _, p := range players {
		tradeup.Players = append(tradeup.Players, p)
	}

	tradeup.Items = items
	return tradeup, nil
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

func (s *storage) RemoveSkinFromTradeup(tradeupID, invID string) error {
	tx, err := s.db.BeginTx(context.Background(), pgx.TxOptions{})
	if err != nil {
		return err
	}
	defer func() {
		tx.Commit(context.Background())
	}()

	q := "delete from tradeups_skins where tradeup_id=$1 and inv_id=$2"
	_, err = tx.Exec(context.Background(), q, tradeupID, invID)
	if err != nil {
		tx.Rollback(context.Background())
		return err
	}

	q = "update inventory set visible=true where id=$1"
	_, err = tx.Exec(context.Background(), q, invID)
	if err != nil {
		tx.Rollback(context.Background())
		return err
	}

	return nil
}

func (s *storage) StartTimer(tradeupID string) error {
	// UTC timestamp is off by 4 hours currently for me
	q := "update tradeups set stop_time=now()+interval '4 hour 5 min',current_status='Waiting' where id=$1"
	_, err := s.db.Exec(context.Background(), q, tradeupID)
	return err
}

func (s *storage) StopTimer(tradeupID string) error {
	q := "update tradeups set stop_time=now()+interval '5 year',current_status='Active' where id=$1"
	_, err := s.db.Exec(context.Background(), q, tradeupID)
	return err
}

func (s *storage) GetStatus(tradeupID string) (string, error) {
	var status string
	q := "select current_status from tradeups where id=$1"
	err := s.db.QueryRow(context.Background(), q, tradeupID).Scan(&status)
	return status, err
}

func (s *storage) SetStatus(tradeupID, status string) error {
	q := "update tradeups set current_status=$1 where id=$2"
	_, err := s.db.Exec(context.Background(), q, status, tradeupID)
	return err
}
